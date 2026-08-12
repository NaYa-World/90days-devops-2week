#!/usr/bin/env bash
# =============================================================================
# ec2-setup.sh — One-shot CI/CD server setup for Amazon Linux 2023
#
# Installs:
#   • Java 17, Maven, Git
#   • Jenkins (on port 8080)
#   • Apache Tomcat 10 (on port 8090)
#
# Usage:
#   chmod +x ec2-setup.sh
#   sudo ./ec2-setup.sh
#
# After running this script:
#   1. Visit http://<ec2-ip>:8080 to complete Jenkins setup
#   2. Install plugins: Generic Webhook Trigger, Git, Maven Integration
#   3. Create a new Pipeline job pointing to this repo's Jenkinsfile
#   4. Add JENKINS_WEBHOOK_TOKEN as a Jenkins Global Environment Variable
#   5. Add JENKINS_URL and JENKINS_TOKEN as GitHub Secrets in your repo
# =============================================================================

set -euo pipefail

# ── Colors for output ─────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Must run as root ──────────────────────────────────────────────
[[ $EUID -ne 0 ]] && error "Run this script as root: sudo ./ec2-setup.sh"

TOMCAT_VERSION="10.1.34"
TOMCAT_HOME="/opt/tomcat"
JENKINS_PORT=8080
TOMCAT_PORT=8090

# =============================================================================
# 1. System update
# =============================================================================
info "Updating system packages..."
dnf update -y

# =============================================================================
# 2. Install Java 17, Maven, Git
# =============================================================================
info "Installing Java 17, Maven, Git..."
dnf install -y java-17-amazon-corretto maven git

java  -version
mvn   -version
git   --version
info "✅ Java, Maven, Git installed"

# =============================================================================
# 3. Install Jenkins
# =============================================================================
info "Adding Jenkins repository..."
wget -O /etc/yum.repos.d/jenkins.repo \
    https://pkg.jenkins.io/redhat-stable/jenkins.repo
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

info "Installing Jenkins..."
dnf install -y jenkins

info "Starting Jenkins on port ${JENKINS_PORT}..."
systemctl enable jenkins
systemctl start  jenkins
systemctl status jenkins --no-pager

info "✅ Jenkins running on port ${JENKINS_PORT}"
echo ""
warning "Jenkins initial admin password:"
cat /var/lib/jenkins/secrets/initialAdminPassword || true

# =============================================================================
# 4. Install Apache Tomcat 10 on port 8090
# =============================================================================
info "Downloading Apache Tomcat ${TOMCAT_VERSION}..."
cd /tmp
wget -q "https://downloads.apache.org/tomcat/tomcat-10/v${TOMCAT_VERSION}/bin/apache-tomcat-${TOMCAT_VERSION}.tar.gz"

info "Extracting Tomcat..."
tar -xzf "apache-tomcat-${TOMCAT_VERSION}.tar.gz"
mv "apache-tomcat-${TOMCAT_VERSION}" "${TOMCAT_HOME}"

# ── Change Tomcat's connector port from 8080 → 8090 ──────────────
info "Configuring Tomcat to run on port ${TOMCAT_PORT}..."
sed -i "s/port=\"8080\"/port=\"${TOMCAT_PORT}\"/" "${TOMCAT_HOME}/conf/server.xml"

# ── Create tomcat system user ─────────────────────────────────────
info "Creating 'tomcat' system user..."
useradd -r -m -U -d "${TOMCAT_HOME}" -s /bin/false tomcat 2>/dev/null || true
chown -R tomcat:tomcat "${TOMCAT_HOME}"
chmod -R 755 "${TOMCAT_HOME}"

# ── Allow jenkins user to deploy WARs without sudo password ───────
info "Granting Jenkins passwordless sudo for Tomcat webapps..."
cat > /etc/sudoers.d/jenkins-tomcat << 'EOF'
# Allow Jenkins to copy WARs and remove old deployments from Tomcat
jenkins ALL=(ALL) NOPASSWD: /usr/bin/cp /var/lib/jenkins/workspace/*/target/*.war /opt/tomcat/webapps/
jenkins ALL=(ALL) NOPASSWD: /usr/bin/rm -f /opt/tomcat/webapps/*.war
jenkins ALL=(ALL) NOPASSWD: /usr/bin/rm -rf /opt/tomcat/webapps/devops-roadmap*
EOF
chmod 440 /etc/sudoers.d/jenkins-tomcat

# ── Create systemd service for Tomcat ────────────────────────────
info "Creating Tomcat systemd service..."
cat > /etc/systemd/system/tomcat.service << EOF
[Unit]
Description=Apache Tomcat 10 Web Server
After=network.target

[Service]
Type=forking
User=tomcat
Group=tomcat
Environment="JAVA_HOME=/usr/lib/jvm/java-17-amazon-corretto"
Environment="CATALINA_HOME=${TOMCAT_HOME}"
Environment="CATALINA_BASE=${TOMCAT_HOME}"
Environment="CATALINA_PID=${TOMCAT_HOME}/temp/tomcat.pid"
Environment="CATALINA_OPTS=-Xms256M -Xmx512M -server -XX:+UseParallelGC"
ExecStart=${TOMCAT_HOME}/bin/startup.sh
ExecStop=${TOMCAT_HOME}/bin/shutdown.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable tomcat
systemctl start  tomcat
systemctl status tomcat --no-pager

info "✅ Tomcat running on port ${TOMCAT_PORT}"

# =============================================================================
# 5. Open firewall ports (informational — adjust your EC2 Security Group)
# =============================================================================
info "Checking firewalld..."
if systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --add-port="${JENKINS_PORT}/tcp"
    firewall-cmd --permanent --add-port="${TOMCAT_PORT}/tcp"
    firewall-cmd --reload
    info "Firewall ports opened: ${JENKINS_PORT}, ${TOMCAT_PORT}"
else
    warning "firewalld not running. Make sure your EC2 Security Group allows:"
    warning "  • Port ${JENKINS_PORT}/tcp  → Jenkins UI"
    warning "  • Port ${TOMCAT_PORT}/tcp  → Tomcat App"
    warning "  • Port 22/tcp           → SSH"
fi

# =============================================================================
# 6. Print next steps
# =============================================================================
EC2_IP=$(curl -s --max-time 5 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "<your-ec2-ip>")

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ EC2 Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  Jenkins UI:  http://${EC2_IP}:${JENKINS_PORT}"
echo "  Tomcat App:  http://${EC2_IP}:${TOMCAT_PORT}"
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "  1. Open http://${EC2_IP}:${JENKINS_PORT} and complete Jenkins setup"
echo "  2. Install plugins: Generic Webhook Trigger, Git, Maven Integration"
echo "  3. Create a Pipeline job → SCM → GitHub repo → Jenkinsfile"
echo "  4. In Jenkins: Manage Jenkins → Configure System → Global env vars"
echo "       JENKINS_WEBHOOK_TOKEN = <any-secret-string-you-choose>"
echo "  5. In GitHub repo: Settings → Secrets → Actions → New secret:"
echo "       JENKINS_URL   = http://${EC2_IP}:${JENKINS_PORT}"
echo "       JENKINS_TOKEN = <same-secret-string-from-step-4>"
echo ""
echo "  Then push any change to main and watch the full pipeline run! 🚀"
echo ""
