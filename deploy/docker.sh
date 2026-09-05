#!/usr/bin/env bash
#
# Pilote de la pile Docker du site ASC Cambérène.
#
#   ./deploy/docker.sh <commande>
#
# Toutes les commandes passent par le même fichier d'environnement et le même
# projet Compose : il n'y a qu'une pile, et on ne risque pas d'en démarrer une
# seconde avec des secrets différents.

set -euo pipefail

# Le script est appelable depuis n'importe où : on se replace à la racine du
# projet, qui est le dossier parent de celui-ci.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-$ROOT/.env.docker}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"

# ---------------------------------------------------------------------------
# Outils
# ---------------------------------------------------------------------------

red()  { printf '\033[31m%s\033[0m\n' "$*"; }
green(){ printf '\033[32m%s\033[0m\n' "$*"; }
step() { printf '\033[1m→ %s\033[0m\n' "$*"; }

die() { red "✗ $*"; exit 1; }

compose() { docker compose --env-file "$ENV_FILE" "$@"; }

require_env() {
  [ -f "$ENV_FILE" ] || die "$ENV_FILE est absent. Le créer :  cp .env.docker.example .env.docker"

  # Un secret vide passerait la substitution Compose et ne serait rattrapé
  # qu'au démarrage du conteneur, dans un journal. Autant le dire ici.
  local missing=()
  for key in SITE_URL JWT_ACCESS_SECRET JWT_REFRESH_SECRET; do
    grep -qE "^${key}=.+" "$ENV_FILE" || missing+=("$key")
  done
  [ ${#missing[@]} -eq 0 ] || die "À renseigner dans $ENV_FILE : ${missing[*]}"
}

# ---------------------------------------------------------------------------
# Commandes
# ---------------------------------------------------------------------------

cmd_up() {
  require_env
  step "Construction des images"
  compose build "$@"
  step "Démarrage de la pile"
  compose up -d
  cmd_wait
}

cmd_down() {
  step "Arrêt de la pile"
  # Les volumes sont conservés : `down` ne doit jamais effacer la base.
  compose down
  green "✓ Pile arrêtée (base et images téléversées conservées)"
}

cmd_restart() { require_env; compose restart "$@"; cmd_wait; }

cmd_logs()   { compose logs -f --tail=100 "$@"; }
cmd_status() { compose ps; }
cmd_shell()  { compose exec "${1:-api}" sh; }

# Attend que la pile réponde vraiment, plutôt que de rendre la main dès que les
# conteneurs sont créés.
cmd_wait() {
  step "Vérification"
  local port
  port="$(grep -E '^WEB_PORT=' "$ENV_FILE" 2>/dev/null | cut -d= -f2 || true)"
  port="${port:-8080}"

  local i
  for i in $(seq 1 30); do
    if curl -fsS -o /dev/null "http://127.0.0.1:${port}/" \
       && curl -fsS -o /dev/null "http://127.0.0.1:${port}/api/products"; then
      green "✓ Site et API répondent sur 127.0.0.1:${port}"
      return 0
    fi
    sleep 2
  done

  red "✗ La pile ne répond pas après 60 s. Derniers journaux :"
  compose logs --tail=40
  return 1
}

cmd_deploy() {
  require_env
  step "Récupération des sources"
  # `--ff-only` : un déploiement ne résout pas de conflit.
  git pull --ff-only
  cmd_up
  green "✓ Déploiement terminé"
}

cmd_superadmin() {
  require_env
  local email="${1:-}"
  [ -n "$email" ] || die "Usage : $0 superadmin <email> [mot-de-passe]"
  shift
  local pass="${1:-}"

  step "Création du super administrateur"
  if [ -n "$pass" ]; then
    compose exec -T api npm run create:superadmin -- "$email" --password "$pass"
  else
    # Sans mot de passe fourni, le script en tire un au sort et l'affiche une
    # seule fois : il n'est pas stocké en clair, donc pas récupérable ensuite.
    compose exec -T api npm run create:superadmin -- "$email"
  fi
}

cmd_seed() {
  require_env
  step "Chargement du contenu de démonstration"
  compose exec -T api npm run seed
}

cmd_backup() {
  require_env
  mkdir -p "$BACKUP_DIR"
  local stamp; stamp="$(date +%Y%m%d-%H%M%S)"

  step "Sauvegarde de la base"
  compose exec -T mongo mongodump --archive --gzip \
    --db "$(grep -E '^MONGO_DB=' "$ENV_FILE" | cut -d= -f2 || echo asc_camberene)" \
    > "$BACKUP_DIR/mongo-$stamp.archive.gz"

  step "Sauvegarde des images téléversées"
  compose exec -T api tar czf - -C /app uploads > "$BACKUP_DIR/uploads-$stamp.tgz"

  green "✓ $BACKUP_DIR/mongo-$stamp.archive.gz"
  green "✓ $BACKUP_DIR/uploads-$stamp.tgz"
}

cmd_restore() {
  require_env
  local archive="${1:-}"
  [ -f "$archive" ] || die "Usage : $0 restore <fichier mongo-*.archive.gz>"

  red "Cette opération remplace le contenu actuel de la base."
  read -r -p "Confirmer avec le nom de la base (${MONGO_DB:-asc_camberene}) : " answer
  [ "$answer" = "${MONGO_DB:-asc_camberene}" ] || die "Annulé"

  step "Restauration"
  compose exec -T mongo mongorestore --archive --gzip --drop < "$archive"
  green "✓ Base restaurée"
}

usage() {
  cat <<'USAGE'
Pilote de la pile Docker — ASC Cambérène

  up                      construit les images et démarre la pile
  down                    arrête la pile (base et images conservées)
  restart [service]       redémarre tout, ou un service
  deploy                  git pull, reconstruit, redémarre, vérifie
  status                  état des conteneurs
  logs [service]          journaux en continu
  shell [service]         ouvre un shell (api par défaut)
  superadmin <email> [mdp]  crée le premier compte d'administration
  seed                    charge le contenu de démonstration
  backup                  sauvegarde base + images téléversées
  restore <archive>       restaure une sauvegarde de base

Environnement lu dans .env.docker (voir .env.docker.example).
USAGE
}

case "${1:-}" in
  up)          shift; cmd_up "$@" ;;
  down)        shift; cmd_down ;;
  restart)     shift; cmd_restart "$@" ;;
  deploy)      shift; cmd_deploy ;;
  status)      shift; cmd_status ;;
  logs)        shift; cmd_logs "$@" ;;
  shell)       shift; cmd_shell "$@" ;;
  superadmin)  shift; cmd_superadmin "$@" ;;
  seed)        shift; cmd_seed ;;
  backup)      shift; cmd_backup ;;
  restore)     shift; cmd_restore "$@" ;;
  ""|-h|--help|help) usage ;;
  *) red "Commande inconnue : $1"; echo; usage; exit 1 ;;
esac
