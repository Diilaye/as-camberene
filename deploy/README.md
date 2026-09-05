# Déploiement sur VPS — ascambere.sn

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
