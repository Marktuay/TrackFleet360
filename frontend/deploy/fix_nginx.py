#!/usr/bin/env python3
import os
import subprocess
import glob

print("🚀 Running Nginx & SSL Fixer Script...")

# 1. Find SSL Certs
cert_path = None
key_path = None

letsencrypt_dirs = glob.glob("/etc/letsencrypt/live/*")
print("Found Let's Encrypt dirs:", letsencrypt_dirs)

for d in letsencrypt_dirs:
    fullchain = os.path.join(d, "fullchain.pem")
    privkey = os.path.join(d, "privkey.pem")
    if "app.newcenturyni.com" in d and os.path.exists(fullchain):
        cert_path = fullchain
        key_path = privkey
        break

if not cert_path:
    for d in letsencrypt_dirs:
        fullchain = os.path.join(d, "fullchain.pem")
        privkey = os.path.join(d, "privkey.pem")
        if os.path.exists(fullchain):
            cert_path = fullchain
            key_path = privkey
            break

print(f"🔑 Using SSL Cert: {cert_path}")
print(f"🔑 Using SSL Key: {key_path}")

# 2. Write Nginx site for app.newcenturyni.com
app_nginx_config = f"""server {{
    listen 80;
    server_name app.newcenturyni.com;
    return 301 https://$host$request_uri;
}}

server {{
    listen 443 ssl;
    server_name app.newcenturyni.com;

    ssl_certificate {cert_path};
    ssl_certificate_key {key_path};

    # Next.js Web App on Port 3000
    location / {{
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}
}}
"""

with open("/etc/nginx/sites-available/app.newcenturyni.com", "w") as f:
    f.write(app_nginx_config)

# 3. Write Nginx site for trackfleet360.newcenturyni.com
backend_nginx_config = f"""server {{
    listen 80;
    server_name trackfleet360.newcenturyni.com;
    return 301 https://$host$request_uri;
}}

server {{
    listen 443 ssl;
    server_name trackfleet360.newcenturyni.com;

    ssl_certificate {cert_path};
    ssl_certificate_key {key_path};

    location / {{
        proxy_pass http://127.0.0.1:8085;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {{
        alias /home/informatica/TrackFleet360/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }}
}}
"""

with open("/etc/nginx/sites-available/trackfleet360.newcenturyni.com", "w") as f:
    f.write(backend_nginx_config)

# 4. Enable sites and remove default_server
os.makedirs("/etc/nginx/sites-enabled", exist_ok=True)

if os.path.exists("/etc/nginx/sites-enabled/default"):
    os.remove("/etc/nginx/sites-enabled/default")

for s in ["app.newcenturyni.com", "trackfleet360.newcenturyni.com"]:
    src = f"/etc/nginx/sites-available/{s}"
    dst = f"/etc/nginx/sites-enabled/{s}"
    if os.path.exists(src):
        if os.path.islink(dst) or os.path.exists(dst):
            os.remove(dst)
        os.symlink(src, dst)

# 5. Test and reload Nginx
res = subprocess.run(["nginx", "-t"], capture_output=True, text=True)
print("Nginx Test Output:", res.stdout, res.stderr)

if res.returncode == 0:
    subprocess.run(["systemctl", "reload", "nginx"])
    print("✅ SUCCESS: Nginx reloaded successfully!")
else:
    print("❌ Nginx test failed!")
