# Déploiement sur VPS — ascambere.sn

Deux voies, au choix :

| | [Docker](#déploiement-docker-recommandé) | [Installation directe](#installation-directe) |
|---|---|---|
| À installer sur le VPS | Docker, Apache, certbot | Node, MongoDB, Apache, certbot |
| Mise à jour | `./deploy/docker.sh deploy` | `./deploy/deploy.sh` |
| Base de données | conteneur + volume | service système |
| Reproductible | oui, image identique partout | dépend de la machine |

Docker demande moins de choses au VPS et rend la mise à jour plus sûre : si une
image ne construit pas, rien n'est remplacé. La section suivante le décrit ;
l'installation directe vient après, inchangée.

Dans les deux cas, l'Apache de l'hôte porte le certificat et une seule origine
sert tout — le navigateur ne fait donc aucune requête préalable CORS.

---

## Déploiement Docker (recommandé)

```
navigateur ──► Apache de l'hôte :443 ──► conteneur web :8080 ──┬─► /api      ──► conteneur api :4100
                    (certificat)          (site + proxy)       ├─► /uploads  ──► conteneur api :4100
                                                               └─► reste     ──► fichiers statiques
                                                                        conteneur api ──► conteneur mongo
```

Seul le conteneur `web` publie un port, et seulement sur `127.0.0.1` : Mongo et
l'API ne sont joignables que depuis le réseau interne de la pile.

### 1. Sur le VPS

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 apache2 git
sudo a2enmod proxy proxy_http headers
sudo usermod -aG docker "$USER"   # se reconnecter ensuite
```

### 2. Cloner et configurer

```bash
sudo mkdir -p /var/www && sudo chown "$USER" /var/www
git clone git@github.com:Diilaye/as-camberene.git /var/www/as-camberene
cd /var/www/as-camberene

cp .env.docker.example .env.docker
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"  # ×2
nano .env.docker      # SITE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
```

> `SITE_URL` est inscrite dans le bundle au moment de la construction : la
> changer impose de reconstruire l'image, pas seulement de redémarrer.

### 3. Démarrer

```bash
./deploy/docker.sh up
```

Le script construit les images, démarre la pile et **attend qu'elle réponde
vraiment** avant de rendre la main. En cas d'échec, il affiche les journaux.

### 4. Apache et certificat

```bash
sudo cp deploy/apache-docker.conf /etc/apache2/sites-available/ascambere.conf
sudo a2ensite ascambere && sudo a2dissite 000-default
sudo apache2ctl configtest && sudo systemctl reload apache2

sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d ascambere.sn -d www.ascambere.sn
```

Reprendre ensuite dans le vhost 443 généré par certbot les deux en-têtes
`X-Forwarded-*` en `https`/`443` — l'API en a besoin pour distinguer les
visiteurs derrière le proxy.

### 5. Premier compte et contenu

```bash
./deploy/docker.sh superadmin direction@ascambere.sn
./deploy/docker.sh seed          # facultatif : contenu de démonstration
```

### Le script au quotidien

```
./deploy/docker.sh up                    construit et démarre
./deploy/docker.sh deploy                git pull, reconstruit, redémarre, vérifie
./deploy/docker.sh status                état des conteneurs
./deploy/docker.sh logs [service]        journaux en continu
./deploy/docker.sh shell [service]       un shell dans un conteneur
./deploy/docker.sh superadmin <email>    crée un compte d'administration
./deploy/docker.sh seed                  charge le contenu de démonstration
./deploy/docker.sh backup                sauvegarde base + images téléversées
./deploy/docker.sh restore <archive>     restaure une sauvegarde
./deploy/docker.sh down                  arrête (base et images conservées)
```

`down` ne touche jamais aux volumes : la base et les images téléversées
survivent à un arrêt comme à une reconstruction d'image.

### Sauvegardes

```bash
./deploy/docker.sh backup      # → backups/mongo-*.archive.gz et uploads-*.tgz
```

À planifier, par exemple chaque nuit :

```
0 3 * * * cd /var/www/as-camberene && ./deploy/docker.sh backup
```

### Dépannage

| Symptôme | Où regarder |
|---|---|
| `up` échoue à la vérification | `./deploy/docker.sh logs` |
| 502 depuis l'hôte | la pile tourne-t-elle ? `./deploy/docker.sh status` |
| Port déjà pris | changer `WEB_PORT` dans `.env.docker`, **et** `SITE_URL` si le port est public |
| Secret manquant | le script le dit avant de démarrer quoi que ce soit |
| Images 403 | droits des fichiers ; l'image les normalise, reconstruire avec `--no-cache` |

---

## Installation directe

Site construit servi par Apache, API Node derrière le même domaine, MongoDB
local. Une seule origine : Apache transmet `/api` et `/uploads` au serveur
Node, tout le reste est du fichier statique.

```
navigateur ──► Apache :443 ──┬─► /api      ──► Node :4100
                             ├─► /uploads  ──► Node :4100
                             └─► reste     ──► /var/www/as-camberene/dist
                                                        Node ──► MongoDB :27017
```

---

## 1. DNS

Deux enregistrements A vers l'IP du VPS :

| Type | Nom | Valeur |
|---|---|---|
| A | `ascambere.sn` | `<IP du VPS>` |
| A | `www` | `<IP du VPS>` |

Attendre la propagation avant l'étape du certificat :

```bash
dig +short ascambere.sn
```

## 2. Paquets

Sur Debian ou Ubuntu :

```bash
sudo apt update
sudo apt install -y apache2 git curl

# Node 20 LTS — la version des dépôts est trop ancienne
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# MongoDB 7 — suivre la procédure officielle pour la distribution utilisée :
# https://www.mongodb.com/docs/manual/administration/install-on-linux/
sudo systemctl enable --now mongod

sudo a2enmod proxy proxy_http rewrite headers expires deflate
```

## 3. Clé de déploiement et clonage

Le dépôt est privé : le VPS a besoin de sa propre clé, en lecture seule.

```bash
sudo -u www-data ssh-keygen -t ed25519 -C "vps-ascambere" -f /var/www/.ssh/id_ed25519 -N ""
sudo -u www-data cat /var/www/.ssh/id_ed25519.pub
```

Coller cette clé dans **GitHub → dépôt `as-camberene` → Settings → Deploy keys**,
sans cocher l'accès en écriture, puis :

```bash
sudo mkdir -p /var/www && sudo chown www-data:www-data /var/www
sudo -u www-data git clone git@github.com:Diilaye/as-camberene.git /var/www/as-camberene
```

## 4. Variables d'environnement

Le fichier `server/.env` **n'est pas dans le dépôt** : il porte les secrets et
se crée sur le serveur.

```bash
cd /var/www/as-camberene/server
sudo -u www-data cp .env.example .env

# Deux secrets distincts, longs, tirés au hasard
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

sudo -u www-data nano .env
```

À renseigner :

```ini
NODE_ENV=production
PORT=4100
MONGODB_URI=mongodb://127.0.0.1:27017/asc_camberene
JWT_ACCESS_SECRET=<premier secret>
JWT_REFRESH_SECRET=<second secret>
CORS_ORIGINS=https://ascambere.sn,https://www.ascambere.sn
```

> Le serveur refuse de démarrer si un secret a gardé sa valeur d'exemple et que
> `NODE_ENV=production`. C'est voulu : un JWT prévisible se forge.

Le site, lui, lit `.env.production` qui **est** dans le dépôt — il ne contient
aucun secret, seulement l'URL publique de l'API.

## 5. Première construction

```bash
cd /var/www/as-camberene
sudo -u www-data npm ci
sudo -u www-data npm run build          # → dist/

cd server
sudo -u www-data npm ci
sudo -u www-data npm run build          # → server/dist/index.js
sudo -u www-data mkdir -p uploads
```

## 6. Service de l'API

```bash
sudo cp /var/www/as-camberene/deploy/asc-camberene-api.service \
        /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now asc-camberene-api
sudo systemctl status asc-camberene-api
curl -s http://127.0.0.1:4100/health
```

## 7. Apache

```bash
sudo cp /var/www/as-camberene/deploy/apache-ascambere.conf \
        /etc/apache2/sites-available/ascambere.conf
sudo a2ensite ascambere
sudo a2dissite 000-default
sudo apache2ctl configtest && sudo systemctl reload apache2
```

## 8. HTTPS

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d ascambere.sn -d www.ascambere.sn
```

Certbot crée le vhost 443 et la redirection depuis le port 80. Le
renouvellement est automatique ; le vérifier une fois :

```bash
sudo certbot renew --dry-run
```

Une fois le certificat vérifié, activer HSTS dans le vhost 443 :

```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
```

> À n'ajouter qu'après avoir confirmé que HTTPS fonctionne : les navigateurs
> mémorisent cette directive et refuseront ensuite tout accès en clair.

## 9. Premier compte

```bash
cd /var/www/as-camberene/server
sudo -u www-data npm run create:superadmin -- direction@ascambere.sn --password 'un-mot-de-passe-long'
```

Puis connexion sur `https://ascambere.sn/login` — les autres comptes se créent
depuis `https://ascambere.sn/admin/utilisateurs`.

Pour partir avec le contenu de démonstration (actualités, boutique, légendes,
frise) :

```bash
sudo -u www-data npm run seed
```

---

## Mises à jour

```bash
sudo -u www-data /var/www/as-camberene/deploy/deploy.sh
```

Le script récupère les sources, reconstruit les deux parties, redémarre l'API
et vérifie qu'elle répond. Il s'arrête à la première erreur plutôt que de
laisser un site à moitié déployé.

`www-data` doit pouvoir redémarrer le service sans mot de passe :

```bash
echo 'www-data ALL=(root) NOPASSWD: /bin/systemctl restart asc-camberene-api' \
  | sudo tee /etc/sudoers.d/asc-camberene-deploy
sudo chmod 440 /etc/sudoers.d/asc-camberene-deploy
```

## Sauvegardes

Deux choses à sauvegarder, et elles seules :

```bash
# Base de données
mongodump --db asc_camberene --archive=/var/backups/asc-$(date +%F).archive --gzip

# Images téléversées depuis l'administration
tar czf /var/backups/uploads-$(date +%F).tgz -C /var/www/as-camberene/server uploads
```

Le reste — code, dépendances, site construit — se reconstruit depuis le dépôt.

## Dépannage

| Symptôme | Où regarder |
|---|---|
| Page blanche | `dist/` construit ? `sudo -u www-data npm run build` |
| 404 en rechargeant `/admin/...` | `FallbackResource` absent, ou `mod_rewrite` non activé |
| `/api` renvoie du HTML | `mod_proxy` non activé, ou `ProxyPass` après le repli SPA |
| 502 sur `/api` | `systemctl status asc-camberene-api` |
| L'API ne démarre pas | `journalctl -u asc-camberene-api -n 50` — souvent un secret manquant |
| Images téléversées absentes | droits sur `server/uploads` pour `www-data` |
