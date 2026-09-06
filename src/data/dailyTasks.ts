export interface DailyTask {
  day: number;
  title: string;
  description?: string;
  locked?: boolean;
}

export const dailyTasks: DailyTask[] = [
  {
    day: 1,
    title: "Linux User Setup with Non-Interactive Shell",
    description: "To accommodate the backup agent tool's specifications, the system admin team at xFusionCorp Industries requires the creation of a user with a non-interactive shell.\n\nTask:\nCreate a user named john with a non-interactive shell on App Server 3.\n\nHint: Use /sbin/nologin as the shell when creating the user with useradd.",
    locked: false
  },
  {
    day: 2,
    title: "Temporary User Setup with Expiry",
    description: "The system admin team at xFusionCorp Industries needs a temporary user account for a contractor working on a short-term project.\n\nTask:\nCreate a user named javed on App Server 1 in Stratos Datacenter. Set the account to expire on 2021-02-17. Use any appropriate shell.\n\nHint: Use useradd with the -e flag to set expiry date. Verify with chage -l <username>.",
    locked: false
  },
  {
    day: 3,
    title: "Secure Root SSH Access",
    description: "The xFusionCorp Industries security team wants to harden SSH access on all servers to prevent direct root login.\n\nTask:\nDisable direct root SSH login on all App Servers in the Stratos Datacenter.\n\nHint: Set PermitRootLogin no in /etc/ssh/sshd_config, then restart the sshd service on each App Server.",
    locked: false
  },
  {
    day: 4,
    title: "Script Execution Permissions",
    description: "xFusionCorp Industries has a deployment script that needs to be made executable by the correct user and group.\n\nTask:\nThere is a script /tmp/nautilus.sh on App Server 1. Update its permissions so the owner is tony and the group is sysops, and ensure the file is executable by the owner only.\n\nHint: Use chown and chmod commands. chmod 700 /tmp/nautilus.sh sets execute for owner only.",
    locked: false
  },
  {
    day: 5,
    title: "SELinux Installation and Configuration",
    description: "The xFusionCorp Industries security team wants SELinux enabled and enforcing on the application servers to improve system security.\n\nTask:\nInstall SELinux on App Server 3 (if not already installed) and set it to enforcing mode permanently.\n\nHint: Install selinux-policy package, set SELINUX=enforcing in /etc/selinux/config, and reboot to apply. Verify with getenforce.",
    locked: false
  },
  {
    day: 6,
    title: "Create a Cron Job",
    description: "The xFusionCorp Industries system admin team needs an automated task scheduled via cron.\n\nTask:\nCreate a cron job for user tony on App Server 1 that runs the command /usr/bin/bzip2 /home/tony at 00:40 every day.\n\nHint: Use crontab -e -u tony to open the crontab for tony. Format: 40 00 * * * /usr/bin/bzip2 /home/tony",
    locked: false
  },
  {
    day: 7,
    title: "Linux SSH Authentication",
    description: "xFusionCorp Industries wants to set up key-based SSH authentication for a user to improve security.\n\nTask:\nCreate an RSA key pair for user javed on Jump Server, then copy the public key to App Server 1 for passwordless SSH authentication.\n\nHint: Use ssh-keygen to generate the keys. Then use ssh-copy-id or manually append the public key to ~/.ssh/authorized_keys on the target server.",
    locked: false
  },
  {
    day: 8,
    title: "Install Ansible",
    description: "The xFusionCorp Industries DevOps team wants to start automating infrastructure tasks using Ansible.\n\nTask:\nInstall Ansible on the Jump Server (also referred to as the Ansible controller). After installation, create an inventory file at /home/thor/playbooks/inventory with the App Servers listed.\n\nHint: Install Ansible via pip or yum/dnf. Verify with ansible --version.",
    locked: false
  },
  {
    day: 9,
    title: "MariaDB Troubleshooting",
    description: "The MariaDB service on one of the App Servers in xFusionCorp Industries is not starting properly. The team needs it fixed.\n\nTask:\nTroubleshoot and fix the MariaDB service on App Server 1 so that it starts successfully and the data is accessible.\n\nHint: Check systemctl status mariadb and journalctl -xe for errors. Common issues include incorrect config in /etc/my.cnf or port conflicts.",
    locked: false
  },
  {
    day: 10,
    title: "Linux Bash Scripts",
    description: "The DevOps team at xFusionCorp Industries needs a Bash script to automate a repetitive task.\n\nTask:\nCreate a script /home/thor/add_users.sh on the Jump Server that reads a list of usernames from /home/thor/users.txt and creates each user on the system if they do not already exist.\n\nHint: Use a while loop to read the file, and use id <user> to check existence before useradd.",
    locked: false
  },
  {
    day: 11,
    title: "Install and Configure Tomcat Server",
    description: "xFusionCorp Industries needs a Java web application server set up on one of their App Servers.\n\nTask:\nInstall Tomcat 9 on App Server 1. Ensure the Tomcat service is enabled and running. Configure it to listen on port 8080.\n\nHint: Download Tomcat from Apache, extract it to /opt/tomcat, configure server.xml for port, and create a systemd service unit. Verify with curl http://localhost:8080.",
    locked: false
  },
  {
    day: 12,
    title: "Linux Network Services",
    description: "The xFusionCorp Industries network team needs to configure and verify network services on the App Servers.\n\nTask:\nOn App Server 2, install and configure vsftpd (FTP server). Ensure the service is started, enabled on boot, and only allows local users to login.\n\nHint: Install vsftpd, set local_enable=YES and anonymous_enable=NO in /etc/vsftpd/vsftpd.conf. Then start and enable the service.",
    locked: false
  },
  {
    day: 13,
    title: "IPtables Installation and Configuration",
    description: "xFusionCorp Industries wants to add firewall rules to control traffic on App Server 2.\n\nTask:\nInstall iptables on App Server 2 (if not already installed). Add a rule to ACCEPT all incoming connections on port 8086. Make the rules persistent across reboots.\n\nHint: Use iptables -A INPUT -p tcp --dport 8086 -j ACCEPT. Save with iptables-save > /etc/sysconfig/iptables.",
    locked: false
  },
  {
    day: 14,
    title: "Linux Process Troubleshooting",
    description: "An application process on one of the App Servers in xFusionCorp Industries is consuming excessive CPU and needs investigation.\n\nTask:\nOn App Server 1, identify the process consuming the most CPU. Kill the process gracefully if it is safe to do so, and document its PID and name.\n\nHint: Use top or ps aux --sort=-%cpu to find the process. Use kill -15 <PID> for graceful termination.",
    locked: false
  },
  {
    day: 15,
    title: "Setup SSL for Nginx",
    description: "xFusionCorp Industries needs HTTPS enabled on their Nginx web server for secure communication.\n\nTask:\nOn App Server 1, generate a self-signed SSL certificate and configure Nginx to use HTTPS on port 443. Redirect HTTP traffic on port 80 to HTTPS.\n\nHint: Use openssl req -x509 -nodes -days 365 -newkey rsa:2048 to generate a cert. Update nginx.conf to add ssl_certificate and ssl_certificate_key directives.",
    locked: false
  },
  {
    day: 16,
    title: "Install and Configure Nginx as an LBR",
    description: "xFusionCorp Industries needs a load balancer to distribute traffic across multiple App Servers.\n\nTask:\nInstall Nginx on the Jump Server and configure it as a load balancer (upstream) that distributes incoming HTTP requests in round-robin fashion across App Server 1, 2, and 3.\n\nHint: Use the upstream block in nginx.conf with the server IPs/ports of each app server. Use proxy_pass to forward requests.",
    locked: false
  },
  {
    day: 17,
    title: "Install and Configure PostgreSQL",
    description: "xFusionCorp Industries is setting up a PostgreSQL database server for one of their applications.\n\nTask:\nInstall PostgreSQL on App Server 3. Create a database named kodekloud_db, a user named kodekloud_top with password developer@1, and grant all privileges on the database to the user.\n\nHint: Use sudo -u postgres psql to access the postgres prompt. CREATE USER and CREATE DATABASE commands, then GRANT ALL PRIVILEGES.",
    locked: false
  },
  {
    day: 18,
    title: "Install and Configure DB Server",
    description: "The xFusionCorp Industries team needs a database server set up for a new application deployment.\n\nTask:\nInstall MariaDB on App Server 1. Start and enable the MariaDB service. Create a database called kodekloud_db and a user named kodekloud_rin with password Rc5C9EyvbU. Grant all privileges on the database to that user.\n\nHint: Run mysql_secure_installation after install. Use CREATE DATABASE, CREATE USER, and GRANT commands in the MariaDB prompt.",
    locked: false
  },
  {
    day: 19,
    title: "Install and Configure Web Application",
    description: "xFusionCorp Industries needs a WordPress-based web application installed and configured on their infrastructure.\n\nTask:\nInstall WordPress on App Server 2. Configure it to use the existing MariaDB database named kodekloud_db with user kodekloud_rin and password Rc5C9EyvbU. Serve it on port 80 using Apache.\n\nHint: Download WordPress, extract to /var/www/html, configure wp-config.php, and start httpd. Ensure SELinux/firewall allows traffic.",
    locked: false
  },
  {
    day: 20,
    title: "Configure Nginx + PHP-FPM Using Unix Sock",
    description: "xFusionCorp Industries wants Nginx to communicate with PHP-FPM via a Unix socket for better performance.\n\nTask:\nOn App Server 1, configure Nginx to pass PHP requests to PHP-FPM using a Unix domain socket (php-fpm.sock) instead of TCP. Verify PHP processing works correctly.\n\nHint: In www.conf set listen = /run/php-fpm/www.sock. In nginx.conf set fastcgi_pass unix:/run/php-fpm/www.sock. Restart both services.",
    locked: false
  },
  {
    day: 21,
    title: "Set Up Git Repository on Storage Server",
    description: "The xFusionCorp Industries development team needs a central bare Git repository on the Storage Server.\n\nTask:\nCreate a bare Git repository at /opt/apps.git on the Storage Server. Initialize it as a bare repo. Ensure the natasha user has ownership of this directory.\n\nHint: Use git init --bare /opt/apps.git. Then chown -R natasha:natasha /opt/apps.git.",
    locked: false
  },
  {
    day: 22,
    title: "Clone Git Repository on Storage Server",
    description: "The xFusionCorp Industries team wants to clone an existing remote repository to the Storage Server.\n\nTask:\nOn the Storage Server, clone the Git repository from https://github.com/kodekloudhub/Linux.git to /opt/apps directory.\n\nHint: Use git clone <url> /opt/apps. Verify with ls -la /opt/apps and git -C /opt/apps log.",
    locked: false
  },
  {
    day: 23,
    title: "Fork a Git Repository",
    description: "A developer at xFusionCorp Industries needs to work on an open source project by forking it.\n\nTask:\nFork the repository https://github.com/kodekloudhub/Linux to your personal GitHub account. Then clone your fork to /opt/repos/linux on the Jump Server.\n\nHint: Use the GitHub UI to fork, then git clone your fork URL. Set the upstream remote to the original with git remote add upstream.",
    locked: false
  },
  {
    day: 24,
    title: "Git Create Branches",
    description: "The development team at xFusionCorp Industries needs to work on a new feature using Git branches.\n\nTask:\nOn the Jump Server, navigate to /opt/apps repository. Create a new branch named xfusioncorp_apps from the master branch. Push it to the remote origin.\n\nHint: Use git checkout -b xfusioncorp_apps to create and switch. Then git push origin xfusioncorp_apps to push the branch.",
    locked: false
  },
  {
    day: 25,
    title: "Git Merge Branches",
    description: "The feature branch at xFusionCorp Industries is ready to be merged into the main branch.\n\nTask:\nOn the Jump Server in the /opt/apps repository, merge the branch xfusioncorp_apps into the master branch. Push the updated master to the remote origin.\n\nHint: git checkout master, then git merge xfusioncorp_apps. Resolve any conflicts, then git push origin master.",
    locked: false
  },
  {
    day: 26,
    title: "Git Manage Remotes",
    description: "The xFusionCorp Industries team needs to manage multiple remote repositories for their project.\n\nTask:\nOn the Jump Server in the /opt/apps repository, list all configured remotes. Add a new remote named backup pointing to user@storage:/opt/apps.git. Verify the remote was added correctly.\n\nHint: git remote -v lists remotes. git remote add backup <url> adds a new one. git remote show backup verifies it.",
    locked: false
  },
  {
    day: 27,
    title: "Git Revert Some Changes",
    description: "A recent commit to the xFusionCorp Industries repository introduced a bug and needs to be reverted.\n\nTask:\nOn the Jump Server in the /opt/apps repository, revert the most recent commit on the master branch without deleting the commit history. Push the revert commit to origin.\n\nHint: Use git log to find the commit hash. Then git revert <commit-hash> to create a revert commit. Push with git push origin master.",
    locked: false
  },
  {
    day: 28,
    title: "Git Cherry Pick",
    description: "xFusionCorp Industries needs to apply a specific commit from a feature branch to the master branch without merging.\n\nTask:\nOn the Jump Server, identify the commit with message 'Add feature' in the branch xfusioncorp_apps. Cherry-pick it onto the master branch and push to origin.\n\nHint: Get the commit hash with git log xfusioncorp_apps. Then on master branch run git cherry-pick <hash>. Push the result.",
    locked: false
  },
  {
    day: 29,
    title: "Manage Git Pull Requests",
    description: "The development team at xFusionCorp Industries uses GitHub Pull Requests for code review.\n\nTask:\nOn your forked repository, create a new branch called feature-xyz, add a file called feature.txt with some content, commit it, push it to your fork, and then open a Pull Request to the upstream repository's master branch.\n\nHint: Use GitHub's UI or GitHub CLI (gh pr create) to open the PR. Add a clear title and description.",
    locked: false
  },
  {
    day: 30,
    title: "Git Hard Reset",
    description: "The xFusionCorp Industries team made several unwanted commits and needs to completely reset to a previous state.\n\nTask:\nOn the Jump Server in the /opt/apps repository, perform a hard reset to roll back to the commit before the last 2 commits. Force push this state to the remote origin master branch.\n\nHint: Use git reset --hard HEAD~2 to reset. Then git push --force origin master. Be careful — hard reset discards uncommitted changes.",
    locked: false
  },
  {
    day: 31,
    title: "Git Stash",
    description: "A developer at xFusionCorp Industries was working on changes but needs to switch context temporarily without committing.\n\nTask:\nOn the Jump Server in the /opt/apps repository, stash your current uncommitted changes with the message 'in-progress work'. Switch to branch xfusioncorp_apps, do some work, then come back to master and apply the stash.\n\nHint: git stash save 'in-progress work', switch branches, then git stash pop or git stash apply.",
    locked: false
  },
  {
    day: 32,
    title: "Git Rebase",
    description: "xFusionCorp Industries wants to maintain a clean, linear commit history by rebasing instead of merging.\n\nTask:\nOn the Jump Server in the /opt/apps repository, rebase the xfusioncorp_apps branch on top of the master branch. Resolve any conflicts that arise during the rebase.\n\nHint: Checkout xfusioncorp_apps, then git rebase master. Use git rebase --continue after resolving conflicts. Do NOT force push shared branches.",
    locked: false
  },
  {
    day: 33,
    title: "Resolve Git Merge Conflicts",
    description: "Two developers at xFusionCorp Industries modified the same file and a merge conflict has occurred.\n\nTask:\nOn the Jump Server in the /opt/apps repository, merge branch xfusioncorp_apps into master. Resolve the conflict in the conflicted file by keeping changes from both branches. Commit the resolution.\n\nHint: After git merge, look for conflict markers (<<<<<<<, =======, >>>>>>>). Edit the file to resolve, then git add and git commit.",
    locked: false
  },
  {
    day: 34,
    title: "Git Hook",
    description: "xFusionCorp Industries wants to enforce commit message standards using Git hooks.\n\nTask:\nOn the Storage Server in the /opt/apps.git bare repository, create a pre-receive hook that rejects any commit whose message does not start with 'JIRA-'. Test it from the Jump Server.\n\nHint: Create /opt/apps.git/hooks/pre-receive with a shell script that reads the commit message and exits 1 if the pattern fails. Make it executable with chmod +x.",
    locked: false
  },
  {
    day: 35,
    title: "Install Docker Packages and Start Docker Service",
    description: "xFusionCorp Industries is adopting containers and needs Docker installed on the App Servers.\n\nTask:\nInstall Docker on App Server 1. Start the Docker service and enable it to start on boot. Add the user thor to the docker group so they can run Docker commands without sudo.\n\nHint: Install via dnf install docker or use the official Docker install script. systemctl enable --now docker. usermod -aG docker thor.",
    locked: false
  },
  {
    day: 36,
    title: "Deploy Nginx Container on Application Server",
    description: "The xFusionCorp Industries team wants to run Nginx inside a Docker container on App Server 1.\n\nTask:\nOn App Server 1, run an Nginx Docker container named nginx_1 using the nginx:latest image. Map port 8090 on the host to port 80 in the container. The container should run in detached mode.\n\nHint: docker run -d --name nginx_1 -p 8090:80 nginx:latest. Verify with docker ps and curl http://localhost:8090.",
    locked: false
  },
  {
    day: 37,
    title: "Copy File to Docker Container",
    description: "xFusionCorp Industries needs to update a configuration file inside a running Docker container.\n\nTask:\nOn App Server 2, copy the file /tmp/docker.txt from the host into the running container named nginx_1 at the path /tmp/docker.txt inside the container.\n\nHint: Use docker cp /tmp/docker.txt nginx_1:/tmp/docker.txt. Verify with docker exec nginx_1 cat /tmp/docker.txt.",
    locked: false
  },
  {
    day: 38,
    title: "Pull Docker Image",
    description: "The xFusionCorp Industries team needs a specific Docker image available locally before deploying.\n\nTask:\nOn App Server 3, pull the Docker image python:3.6 from Docker Hub. Verify the image was downloaded and list all locally available images.\n\nHint: docker pull python:3.6. Verify with docker images | grep python.",
    locked: false
  },
  {
    day: 39,
    title: "Create a Docker Image From Container",
    description: "xFusionCorp Industries wants to capture the current state of a running container as a reusable image.\n\nTask:\nOn App Server 1, run an httpd:latest container named appserver. Install curl inside it. Commit the container as a new image named appserver:v1. Then push it to Docker Hub under your account.\n\nHint: docker run -d --name appserver httpd:latest, then docker exec to install curl, then docker commit appserver appserver:v1.",
    locked: false
  },
  {
    day: 40,
    title: "Docker EXEC Operations",
    description: "The xFusionCorp Industries team needs to execute commands inside a running container for debugging.\n\nTask:\nOn App Server 1, a container named ubuntu_latest is running. Execute commands inside the container to: create a file /tmp/devops.txt, install the wget package, and verify both operations.\n\nHint: Use docker exec -it ubuntu_latest /bin/bash to get an interactive shell. Or run individual commands with docker exec ubuntu_latest <command>.",
    locked: false
  },
  {
    day: 41,
    title: "Write a Docker File",
    description: "xFusionCorp Industries needs a custom Docker image for their Python application.\n\nTask:\nWrite a Dockerfile that uses python:3.8 as the base image, sets the working directory to /app, copies the local requirements.txt and app.py into the image, installs requirements, and sets the CMD to run app.py with Python. Build the image as myapp:v1.\n\nHint: FROM, WORKDIR, COPY, RUN pip install, CMD [\"python\", \"app.py\"]. Build with docker build -t myapp:v1 .",
    locked: false
  },
  {
    day: 42,
    title: "Create a Docker Network",
    description: "xFusionCorp Industries needs containers to communicate privately with each other using a custom Docker network.\n\nTask:\nOn App Server 1, create a custom Docker bridge network named nautilus with subnet 172.18.0.0/24. Launch two containers (busybox and nginx) attached to this network and verify they can ping each other.\n\nHint: docker network create --driver bridge --subnet 172.18.0.0/24 nautilus. Use --network nautilus when running containers.",
    locked: false
  },
  {
    day: 43,
    title: "Docker Ports Mapping",
    description: "xFusionCorp Industries is deploying a web service in Docker and needs the correct port mapping configured.\n\nTask:\nOn App Server 2, run the httpd:latest image as a container named apache. Map host port 8083 to container port 80. Verify the web server is accessible from the host.\n\nHint: docker run -d --name apache -p 8083:80 httpd:latest. Verify with curl http://localhost:8083.",
    locked: false
  },
  {
    day: 44,
    title: "Write a Docker Compose File",
    description: "xFusionCorp Industries wants to orchestrate a multi-container application using Docker Compose.\n\nTask:\nWrite a docker-compose.yml that defines two services: a web service using nginx:latest mapped to port 80, and a db service using mysql:5.7 with the environment variables MYSQL_ROOT_PASSWORD=password. Use a named volume for MySQL data. Bring up the stack.\n\nHint: Define version, services, and volumes. Use docker compose up -d. Verify with docker compose ps.",
    locked: false
  },
  {
    day: 45,
    title: "Resolve Dockerfile Issues",
    description: "A Dockerfile for xFusionCorp Industries is failing to build. You must troubleshoot and fix it.\n\nTask:\nA Dockerfile is present at /opt/docker/Dockerfile on App Server 1. It has syntax and logical errors. Fix the issues so the Docker image builds successfully.\n\nHint: Look for typos, wrong base image tags, missing RUN/COPY instructions, or incorrect CMD format. Use docker build . 2>&1 to read error messages carefully.",
    locked: false
  },
  {
    day: 46,
    title: "Deploy an App on Docker Containers",
    description: "xFusionCorp Industries needs a full application stack deployed using Docker containers.\n\nTask:\nOn App Server 3, deploy a two-container stack: a PHP-Apache container (php:7.4-apache) serving an app from /var/www/html, and a MySQL 5.7 container as the DB. Link them with a Docker network and verify the app can connect to the DB.\n\nHint: Create a user-defined network. Mount a local directory into the Apache container. Pass DB credentials via environment variables.",
    locked: false
  },
  {
    day: 47,
    title: "Docker Python App",
    description: "xFusionCorp Industries needs a Dockerized Python Flask application deployed on App Server 2.\n\nTask:\nWrite a Dockerfile for a Flask application: use python:3.8-slim, install Flask, copy app.py, expose port 5000, and set the CMD to run the Flask app. Build the image as flaskapp:v1 and run a container exposing port 5000 on the host.\n\nHint: Set FLASK_APP and FLASK_ENV in the Dockerfile. Use CMD [\"flask\", \"run\", \"--host=0.0.0.0\"]. Map port with -p 5000:5000.",
    locked: false
  },
  {
    day: 48,
    title: "Deploy Pods in Kubernetes Cluster",
    description: "The xFusionCorp Industries team is getting started with Kubernetes and needs their first Pod deployed.\n\nTask:\nDeploy a pod named nginx-pod using the nginx:latest image in the default namespace. The container should be named nginx-container. Verify the pod is in Running state.\n\nHint: Write a pod.yaml with apiVersion: v1, kind: Pod. Apply with kubectl apply -f pod.yaml. Verify with kubectl get pods.",
    locked: false
  },
  {
    day: 49,
    title: "Deploy Applications with Kubernetes Deployments",
    description: "xFusionCorp Industries needs their application deployed with high availability using Kubernetes Deployments.\n\nTask:\nCreate a Deployment named httpd-deployment in the default namespace using the httpd:latest image with 3 replicas. Expose it via a ClusterIP Service named httpd-service on port 80.\n\nHint: Use kubectl create deployment or write YAML. Include a Service definition of type ClusterIP. Verify with kubectl get deployments,svc.",
    locked: false
  },
  {
    day: 50,
    title: "Set Resource Limits in Kubernetes Pods",
    description: "xFusionCorp Industries needs to set compute resource limits on Kubernetes Pods to ensure fair resource usage.\n\nTask:\nDeploy a pod named resource-pod using the nginx:latest image. Set resource requests to CPU: 100m and Memory: 100Mi, and resource limits to CPU: 200m and Memory: 200Mi.\n\nHint: Add a resources block under the container spec with requests and limits. Apply the pod YAML and verify with kubectl describe pod resource-pod.",
    locked: false
  },
  {
    day: 51,
    title: "Execute Rolling Updates in Kubernetes",
    description: "xFusionCorp Industries needs to update their application to a newer version with zero downtime using Kubernetes rolling updates.\n\nTask:\nThe nginx-deployment currently uses nginx:1.16. Update the image to nginx:1.17 using a rolling update strategy. Verify that all pods are updated successfully without downtime.\n\nHint: Use kubectl set image deployment/nginx-deployment nginx=nginx:1.17. Monitor with kubectl rollout status deployment/nginx-deployment.",
    locked: false
  },
  {
    day: 52,
    title: "Revert Deployment to Previous Version in Kubernetes",
    description: "A recent update to a xFusionCorp Industries Kubernetes Deployment introduced issues. The team needs to roll back.\n\nTask:\nRoll back the nginx-deployment to its previous version. Verify that the rollback was successful and the pods are running the previous image version.\n\nHint: Use kubectl rollout undo deployment/nginx-deployment. Check the revision history with kubectl rollout history deployment/nginx-deployment.",
    locked: false
  },
  {
    day: 53,
    title: "Resolve VolumeMounts Issue in Kubernetes",
    description: "A Kubernetes Pod in xFusionCorp Industries is failing due to a VolumeMount misconfiguration.\n\nTask:\nA pod named nginx-pod is failing because its volumeMount name does not match the volume name defined in the spec. Fix the YAML and redeploy the pod so it runs successfully.\n\nHint: Ensure the name in volumeMounts matches the name in volumes. Check with kubectl describe pod nginx-pod for the error message.",
    locked: false
  },
  {
    day: 54,
    title: "Kubernetes Shared Volumes",
    description: "xFusionCorp Industries needs two containers in the same Pod to share data via a shared volume.\n\nTask:\nCreate a Pod named shared-volume-pod with two containers: a writer container (busybox) that writes to /data/hello.txt, and a reader container (busybox) that reads from the same path. Both containers should share an emptyDir volume mounted at /data.\n\nHint: Define one emptyDir volume in the pod spec and reference it by name in both containers' volumeMounts.",
    locked: false
  },
  {
    day: 55,
    title: "Kubernetes Sidecar Containers",
    description: "xFusionCorp Industries uses the sidecar pattern to add logging to their main application container.\n\nTask:\nCreate a Pod named sidecar-pod with two containers: a main nginx container and a sidecar busybox container that tails /var/log/nginx/access.log. Both containers should share a volume mounted at /var/log/nginx.\n\nHint: Use an emptyDir shared volume. The sidecar command can be: [\"sh\", \"-c\", \"tail -f /var/log/nginx/access.log\"].",
    locked: false
  },
  {
    day: 56,
    title: "Deploy Nginx Web Server on Kubernetes Cluster",
    description: "xFusionCorp Industries needs a fully functional Nginx web server running on their Kubernetes cluster with a LoadBalancer service.\n\nTask:\nCreate a Deployment named nginx-deployment with 2 replicas of nginx:latest. Expose it via a NodePort Service named nginx-service on port 80, NodePort 30080. Verify access via the Node's IP.\n\nHint: Write Deployment and Service YAML files. For NodePort, set type: NodePort and nodePort: 30080 under the ports spec.",
    locked: false
  },
  {
    day: 57,
    title: "Print Environment Variables",
    description: "xFusionCorp Industries needs to pass configuration to a Kubernetes Pod using environment variables.\n\nTask:\nCreate a Pod named env-pod using the nginx:latest image. Set the following environment variables: APP_NAME=nautilus, APP_ENV=production, DB_HOST=mysql-service. Verify the env vars inside the running pod.\n\nHint: Use the env section under containers in the Pod spec. Verify with kubectl exec env-pod -- env | grep APP.",
    locked: false
  },
  {
    day: 58,
    title: "Deploy Grafana on Kubernetes Cluster",
    description: "xFusionCorp Industries wants to deploy Grafana for monitoring dashboards on their Kubernetes cluster.\n\nTask:\nDeploy Grafana using the grafana/grafana:latest image as a Deployment with 1 replica in the monitoring namespace. Expose it via a NodePort Service on port 3000, NodePort 32000. Verify access.\n\nHint: Create the namespace with kubectl create namespace monitoring. Set adminPassword via env var GF_SECURITY_ADMIN_PASSWORD.",
    locked: false
  },
  {
    day: 59,
    title: "Troubleshoot Deployment Issues in Kubernetes",
    description: "A Kubernetes Deployment at xFusionCorp Industries is stuck in a Pending or CrashLoopBackOff state.\n\nTask:\nA deployment named apache-deployment exists but its pods are not running. Investigate the issue, identify the root cause, fix it, and verify all pods are in Running state.\n\nHint: Use kubectl describe deployment, kubectl describe pod, and kubectl logs to find errors. Common issues: wrong image name, insufficient resources, missing secrets.",
    locked: false
  },
  {
    day: 60,
    title: "Persistent Volumes in Kubernetes",
    description: "xFusionCorp Industries needs persistent storage for their database Pod in Kubernetes.\n\nTask:\nCreate a PersistentVolume (PV) named pv-log of 1Gi using hostPath /var/log/data. Create a PersistentVolumeClaim (PVC) named pvc-log requesting 500Mi. Deploy a Pod named log-pod that uses this PVC mounted at /var/log.\n\nHint: Set the accessMode to ReadWriteOnce. Match storageClassName in PV and PVC. Use the PVC name in the pod's volumes section.",
    locked: false
  },
  {
    day: 61,
    title: "Init Containers in Kubernetes",
    description: "xFusionCorp Industries needs an Init Container to prepare the environment before the main application starts.\n\nTask:\nCreate a Pod named init-pod with an init container (busybox) that creates the file /data/ready before the main nginx container starts. Both containers share an emptyDir volume at /data. The main container should only start after the init container completes.\n\nHint: Define initContainers in the pod spec alongside containers. The init container command: [\"sh\", \"-c\", \"echo ready > /data/ready\"].",
    locked: false
  },
  {
    day: 62,
    title: "Manage Secrets in Kubernetes",
    description: "xFusionCorp Industries needs to securely store database credentials as Kubernetes Secrets.\n\nTask:\nCreate a Kubernetes Secret named db-secret in the default namespace with the data: DB_USER=kodekloud and DB_PASS=k0d3kl0ud. Mount this secret as environment variables in a Pod named secret-pod using the nginx:latest image.\n\nHint: kubectl create secret generic db-secret --from-literal=DB_USER=kodekloud --from-literal=DB_PASS=k0d3kl0ud. Reference it using envFrom.secretRef.",
    locked: false
  },
  {
    day: 63,
    title: "Deploy Iron Gallery App on Kubernetes",
    description: "xFusionCorp Industries wants to deploy the Iron Gallery image sharing application on their Kubernetes cluster.\n\nTask:\nDeploy the Iron Gallery app using the kodekloud/irongallery:latest image as a Deployment with 1 replica. Create a NodePort Service to expose it on port 80 (container) and NodePort 32678. Verify the app is accessible.\n\nHint: The app may need specific environment variables for DB configuration. Check the image documentation. Use kubectl get svc to find the NodePort.",
    locked: false
  },
  {
    day: 64,
    title: "Fix Python App Deployed on Kubernetes Cluster",
    description: "A Python application deployed on the xFusionCorp Industries Kubernetes cluster is throwing errors and not serving traffic.\n\nTask:\nA Deployment named python-deployment exists but pods are crashing. Investigate using kubectl logs, fix the identified issue (likely a missing environment variable or wrong port), and verify the app serves traffic correctly.\n\nHint: kubectl logs <pod-name> will show the Python traceback. Common issues: wrong port in the container spec, missing CONFIG env var, or incorrect image tag.",
    locked: false
  },
  {
    day: 65,
    title: "Deploy Redis Deployment on Kubernetes",
    description: "xFusionCorp Industries needs Redis deployed on Kubernetes for caching purposes.\n\nTask:\nDeploy Redis using the redis:alpine image as a Deployment named redis-deployment with 1 replica in the default namespace. Expose it via a ClusterIP Service named redis-service on port 6379. Verify connectivity from another pod.\n\nHint: Use the standard Redis port 6379. Test with kubectl exec -it <some-pod> -- redis-cli -h redis-service ping.",
    locked: false
  },
  {
    day: 66,
    title: "Deploy MySQL on Kubernetes",
    description: "xFusionCorp Industries needs MySQL deployed on Kubernetes with persistent storage.\n\nTask:\nDeploy MySQL 5.7 using a Deployment named mysql-deployment with 1 replica. Set MYSQL_ROOT_PASSWORD=password via environment variable. Create a PVC named mysql-pvc of 1Gi and mount it at /var/lib/mysql. Expose via a ClusterIP Service on port 3306.\n\nHint: Use environment variable for MYSQL_ROOT_PASSWORD. Without a persistent volume, MySQL data is lost on pod restart.",
    locked: false
  },
  {
    day: 67,
    title: "Deploy Guest Book App on Kubernetes",
    description: "xFusionCorp Industries needs the classic Kubernetes Guest Book demo application deployed on their cluster.\n\nTask:\nDeploy the Guest Book application: a Redis master Deployment, Redis slave Deployment, and the PHP frontend Deployment. Expose the frontend via a NodePort Service on port 80. Verify end-to-end functionality.\n\nHint: Use official Kubernetes Guestbook tutorial YAML files. Apply them in order: redis-master, redis-slave, frontend. Check all pods are Running.",
    locked: false
  },
  {
    day: 68,
    title: "Set Up Jenkins Server",
    description: "xFusionCorp Industries is starting their CI/CD journey and needs a Jenkins server set up.\n\nTask:\nInstall Jenkins on the Jump Server. Start and enable the Jenkins service. Configure it to run on port 8080. Complete the initial setup by unlocking Jenkins and installing suggested plugins.\n\nHint: Add the Jenkins repo, install java and jenkins, systemctl enable --now jenkins. Get the initial password from /var/lib/jenkins/secrets/initialAdminPassword.",
    locked: false
  },
  {
    day: 69,
    title: "Install Jenkins Plugins",
    description: "The xFusionCorp Industries DevOps team needs additional Jenkins plugins to enable pipeline and Git capabilities.\n\nTask:\nOn the Jenkins server, install the following plugins: Git, Pipeline, Blue Ocean, and Docker Pipeline. Restart Jenkins after installation and verify the plugins are active.\n\nHint: Use Manage Jenkins → Manage Plugins → Available. Select plugins and install. Or use the Jenkins CLI: java -jar jenkins-cli.jar install-plugin <plugin-name>.",
    locked: false
  },
  {
    day: 70,
    title: "Configure Jenkins User Access",
    description: "xFusionCorp Industries needs role-based access control configured on their Jenkins server.\n\nTask:\nOn Jenkins, enable the Role-Based Authorization Strategy. Create a role named developer with permissions to build jobs and view job logs. Create a user named sarah and assign them the developer role.\n\nHint: Install the Role Strategy Plugin. Go to Manage Jenkins → Configure Global Security. Define roles under Manage Roles and assign under Assign Roles.",
    locked: false
  },
  {
    day: 71,
    title: "Configure Jenkins Job for Package Installation",
    description: "xFusionCorp Industries wants to automate the installation of packages on App Servers via a Jenkins job.\n\nTask:\nCreate a Freestyle Jenkins job named install-packages. Configure it to SSH into App Server 1 and run yum install -y git. Add a post-build step to print 'Packages installed successfully'. Run the job and verify.\n\nHint: Use the SSH Build Agents or Publish Over SSH plugin to run commands on remote servers. Configure SSH credentials in Jenkins Credentials.",
    locked: false
  },
  {
    day: 72,
    title: "Jenkins Parameterized Builds",
    description: "xFusionCorp Industries needs Jenkins jobs that accept parameters for flexible deployments.\n\nTask:\nCreate a Jenkins Freestyle job named parameterized-job with a String parameter named TARGET_ENV with default value staging. The job should print the value of TARGET_ENV to the build log. Test it with the parameter value production.\n\nHint: Check 'This project is parameterized' in the job configuration. Add a String Parameter. In the build step, use echo $TARGET_ENV (shell) or %TARGET_ENV% (batch).",
    locked: false
  },
  {
    day: 73,
    title: "Jenkins Scheduled Jobs",
    description: "xFusionCorp Industries needs a Jenkins job to run automatically on a scheduled basis.\n\nTask:\nConfigure a Jenkins Freestyle job named scheduled-backup to run automatically every day at midnight (00:00). The job should run a shell command that creates a timestamp file in /tmp.\n\nHint: In the job, under Build Triggers, select 'Build periodically'. Use cron syntax: H 0 * * * for daily at midnight. The shell command: echo $(date) > /tmp/backup_timestamp.txt.",
    locked: false
  },
  {
    day: 74,
    title: "Jenkins Database Backup Job",
    description: "xFusionCorp Industries needs an automated Jenkins job to take database backups.\n\nTask:\nCreate a Jenkins job named db-backup that SSHs into App Server 1 and runs mysqldump to back up the kodekloud_db database to /tmp/db_backup.sql. The job should archive the backup file as a Jenkins artifact.\n\nHint: Use the SSH plugin or a shell step with SSH commands. Use Post-build Actions → Archive the Artifacts to save the backup. Pass MySQL credentials securely via Jenkins Credentials.",
    locked: false
  },
  {
    day: 75,
    title: "Jenkins Slave Nodes",
    description: "xFusionCorp Industries wants to distribute build workloads across multiple Jenkins agent nodes.\n\nTask:\nConfigure App Server 1 as a Jenkins Agent/Slave. Connect it to the Jenkins master using the SSH method. Create a Jenkins job that specifically runs on this agent node and executes a simple shell command.\n\nHint: Manage Jenkins → Manage Nodes → New Node. Set up SSH credentials and the remote root directory. In the job, restrict execution to this node label.",
    locked: false
  },
  {
    day: 76,
    title: "Jenkins Project Security",
    description: "xFusionCorp Industries needs to secure a sensitive Jenkins job from unauthorized access.\n\nTask:\nEnable project-level security on Jenkins. Configure a specific job named secure-job so that only user sarah can configure and build it. Other users should only be able to view it.\n\nHint: Ensure project-based matrix security is enabled. In the job configuration, add permissions for sarah (Configure and Build) and for authenticated users (View).",
    locked: false
  },
  {
    day: 77,
    title: "Jenkins Deploy Pipeline",
    description: "xFusionCorp Industries is moving from Freestyle jobs to declarative Pipelines for their deployments.\n\nTask:\nCreate a Jenkins Pipeline job named deploy-pipeline. Write a Declarative Jenkinsfile with stages: Checkout, Build (echo 'Building'), Test (echo 'Testing'), and Deploy (echo 'Deploying to production'). Run the pipeline and verify all stages pass.\n\nHint: Use the pipeline {} block with agent any and stages {}. Store the Jenkinsfile in your SCM repo and configure the job to use SCM or inline script.",
    locked: false
  },
  {
    day: 78,
    title: "Jenkins Conditional Pipeline",
    description: "xFusionCorp Industries needs their Jenkins pipeline to conditionally execute stages based on branch names.\n\nTask:\nWrite a Declarative Jenkinsfile with a Deploy stage that only runs when the branch is main. Add a Notify stage that runs on all branches. Use the when directive to implement the condition.\n\nHint: Inside a stage, use when { branch 'main' } to make it conditional. The Notify stage should have no when condition so it always runs.",
    locked: false
  },
  {
    day: 79,
    title: "Jenkins Deployment Job",
    description: "xFusionCorp Industries needs a Jenkins job that automatically deploys a Docker container after a successful build.\n\nTask:\nCreate a Jenkins Pipeline that builds a Docker image from a Dockerfile in the repo, pushes it to Docker Hub, then SSHes into App Server 1 to pull the new image and restart the container. Use Jenkins credentials for Docker Hub login.\n\nHint: Use withCredentials to access Docker Hub credentials. Use the Docker Pipeline plugin for docker.build() and docker.push().",
    locked: false
  },
  {
    day: 80,
    title: "Jenkins Chained Builds",
    description: "xFusionCorp Industries wants multiple Jenkins jobs to run in sequence, where each job triggers the next.\n\nTask:\nCreate three Jenkins Freestyle jobs: build-job, test-job, and deploy-job. Configure build-job to trigger test-job on success, and test-job to trigger deploy-job on success. Each job should print its own name. Verify the chain executes fully.\n\nHint: In each job's Post-build Actions, select 'Build other projects' and enter the next job name. Trigger only on stable build.",
    locked: false
  },
  {
    day: 81,
    title: "Jenkins Multistage Pipeline",
    description: "xFusionCorp Industries needs a production-grade Jenkins multistage pipeline with parallel execution.\n\nTask:\nWrite a Declarative Jenkinsfile with sequential stages (Checkout, Build) followed by a parallel stage that runs Unit Tests and Integration Tests simultaneously, and finally a Deploy stage. Run on any available agent.\n\nHint: Use parallel { stage('Unit Tests') { ... } stage('Integration Tests') { ... } } inside a stage to run stages in parallel.",
    locked: false
  },
  {
    day: 82,
    title: "Create Ansible Inventory for App Server Testing",
    description: "The xFusionCorp Industries team needs an Ansible inventory set up to manage their App Servers.\n\nTask:\nCreate an Ansible inventory file at /home/thor/ansible/inventory. Add all three App Servers (stapp01, stapp02, stapp03) to a group named stratos_dc. Also add the Storage Server (ststor01) to a separate group named storage. Set appropriate connection variables.\n\nHint: Use INI inventory format. Set ansible_user, ansible_host, and ansible_ssh_pass variables for each host.",
    locked: false
  },
  {
    day: 83,
    title: "Troubleshoot and Create Ansible Playbook",
    description: "A broken Ansible playbook at xFusionCorp Industries needs to be fixed before it can be deployed.\n\nTask:\nA playbook at /home/thor/ansible/playbook.yml has syntax errors. Fix the errors (check YAML indentation, module names, and required parameters) so the playbook runs successfully against stapp01.\n\nHint: Run ansible-playbook --syntax-check playbook.yml to find issues. Use ansible-lint for best practice checks. Common issues: wrong indentation, missing 'name' key, invalid module options.",
    locked: false
  },
  {
    day: 84,
    title: "Copy Data to App Servers using Ansible",
    description: "xFusionCorp Industries needs to distribute configuration files to all App Servers using Ansible.\n\nTask:\nWrite an Ansible playbook that uses the copy module to copy /home/thor/data.txt from the Ansible controller to /tmp/data.txt on all three App Servers (stratos_dc group). Run the playbook and verify the file exists on each server.\n\nHint: Use the copy module with src and dest parameters. Set hosts: stratos_dc. Verify with the fetch module or by SSHing to each server.",
    locked: false
  },
  {
    day: 85,
    title: "Create Files on App Servers using Ansible",
    description: "xFusionCorp Industries needs Ansible to create directory structures and files across App Servers.\n\nTask:\nWrite an Ansible playbook that creates the directory /opt/nautilus on all App Servers, then creates a file /opt/nautilus/welcome.txt with the content 'Welcome to Nautilus'. Set permissions 0755 on the directory and 0644 on the file.\n\nHint: Use the file module to create directories and set permissions. Use the copy or lineinfile module to create the file with content.",
    locked: false
  },
  {
    day: 86,
    title: "Ansible Ping Module Usage",
    description: "The xFusionCorp Industries team needs to verify Ansible connectivity to all managed hosts.\n\nTask:\nUsing the Ansible inventory at /home/thor/ansible/inventory, run an ad-hoc command using the ping module against all hosts. Verify all hosts return pong. Debug any hosts that fail to respond.\n\nHint: ansible all -m ping -i inventory. If hosts fail, check SSH connectivity, inventory variables, and Python installation on remote hosts.",
    locked: false
  },
  {
    day: 87,
    title: "Ansible Install Package",
    description: "xFusionCorp Industries wants to install packages on all App Servers using Ansible.\n\nTask:\nWrite an Ansible playbook that installs the httpd and wget packages on all App Servers (stratos_dc group). After installation, start and enable the httpd service. Verify the service is running.\n\nHint: Use the yum or dnf module for package installation. Use the service module with state: started and enabled: yes to manage the service.",
    locked: false
  },
  {
    day: 88,
    title: "Ansible Blockinfile Module",
    description: "xFusionCorp Industries needs to add a block of configuration lines to a file on all App Servers using Ansible.\n\nTask:\nWrite an Ansible playbook that uses the blockinfile module to add the following block to /etc/hosts on all App Servers:\n# Added by Ansible\n192.168.1.10 mysql-server\n192.168.1.11 redis-server\n\nHint: Use marker option to set unique begin/end markers. The block parameter holds the multi-line content to insert.",
    locked: false
  },
  {
    day: 89,
    title: "Ansible Manage Services",
    description: "xFusionCorp Industries needs Ansible to manage service states across all App Servers.\n\nTask:\nWrite an Ansible playbook that stops the firewalld service on all App Servers if it is running. Then start and enable the httpd service. Finally, verify the final state of both services using the service_facts module.\n\nHint: Use the service module with state: stopped/started and enabled: yes/no. Use the service_facts module and debug to display gathered facts.",
    locked: false
  },
  {
    day: 90,
    title: "Managing ACLs Using Ansible",
    description: "xFusionCorp Industries needs to set fine-grained file permissions using POSIX ACLs via Ansible.\n\nTask:\nWrite an Ansible playbook that sets ACL permissions on /var/www/html on all App Servers: give user apache read and execute permissions, and group developers read, write, and execute permissions. Use the acl module.\n\nHint: The ansible.posix.acl module handles POSIX ACLs. Set entity, etype (user/group), permissions, and state: present.",
    locked: false
  },
  {
    day: 91,
    title: "Ansible Lineinfile Module",
    description: "xFusionCorp Industries needs to modify specific lines in configuration files across App Servers using Ansible.\n\nTask:\nWrite an Ansible playbook that uses the lineinfile module to:\n1. Ensure the line 'ServerName nautilus.stratos.xfusioncorp.com' exists in /etc/httpd/conf/httpd.conf\n2. Remove the line starting with '#ServerAdmin' if it exists\n\nHint: Use regexp to match existing lines and line to specify what to replace/insert. Set state: absent to remove lines.",
    locked: false
  },
  {
    day: 92,
    title: "Managing Jinja2 Templates Using Ansible",
    description: "xFusionCorp Industries wants to use Jinja2 templates to generate dynamic configuration files on App Servers.\n\nTask:\nCreate a Jinja2 template file httpd.conf.j2 that uses variables {{ server_name }}, {{ server_port }}, and {{ doc_root }}. Write an Ansible playbook that renders the template with specific values and deploys it to /etc/httpd/conf/httpd.conf on all App Servers.\n\nHint: Use the template module with src pointing to the .j2 file and dest as the target path. Define variables in vars or host_vars.",
    locked: false
  },
  {
    day: 93,
    title: "Using Ansible Conditionals",
    description: "xFusionCorp Industries manages mixed OS environments and needs Ansible to conditionally execute tasks.\n\nTask:\nWrite an Ansible playbook that installs httpd only if the OS family is RedHat, and apache2 only if the OS family is Debian. Use when conditionals and ansible_os_family fact. Also print a message with the actual OS family detected on each host.\n\nHint: when: ansible_os_family == 'RedHat'. Use the debug module with msg: \"OS is {{ ansible_os_family }}\" to print the detected family.",
    locked: false
  },
  {
    day: 94,
    title: "Create VPC Using Terraform",
    description: "xFusionCorp Industries is moving to AWS and needs their network infrastructure defined as code using Terraform.\n\nTask:\nWrite a Terraform configuration that creates a VPC in AWS with CIDR block 10.0.0.0/16. Enable DNS hostnames and DNS resolution. Add a tag Name=nautilus-vpc. Initialize Terraform and apply the configuration.\n\nHint: Use the aws_vpc resource. Configure the AWS provider with your region. Run terraform init, terraform plan, and terraform apply. Verify in AWS Console.",
    locked: false
  },
  {
    day: 95,
    title: "Create Security Group Using Terraform",
    description: "xFusionCorp Industries needs to define firewall rules as code using Terraform Security Groups.\n\nTask:\nWrite a Terraform configuration that creates a Security Group named nautilus-sg in the existing VPC. Allow inbound HTTP (80), HTTPS (443), and SSH (22) from anywhere. Allow all outbound traffic. Tag it appropriately.\n\nHint: Use the aws_security_group resource. Define ingress and egress blocks. Reference the VPC using the vpc_id from the VPC resource or a data source.",
    locked: false
  },
  {
    day: 96,
    title: "Create EC2 Instance Using Terraform",
    description: "xFusionCorp Industries needs their application servers provisioned on AWS EC2 using Terraform.\n\nTask:\nWrite a Terraform configuration that creates an EC2 instance of type t2.micro using the Amazon Linux 2 AMI. Place it in the nautilus-sg Security Group. Add a Name tag. Output the instance's public IP address.\n\nHint: Use the aws_instance resource. Find the AMI ID using a data source (aws_ami). Add an output block to display the public_ip attribute.",
    locked: false
  },
  {
    day: 97,
    title: "Create IAM Policy Using Terraform",
    description: "xFusionCorp Industries needs to define AWS IAM policies as code using Terraform for least-privilege access.\n\nTask:\nWrite a Terraform configuration that creates an IAM Policy named nautilus-s3-policy that allows s3:GetObject and s3:PutObject on all S3 buckets. Create an IAM User named nautilus-user and attach the policy to the user.\n\nHint: Use aws_iam_policy with a JSON policy document, aws_iam_user, and aws_iam_user_policy_attachment. Use the jsonencode() function or aws_iam_policy_document data source.",
    locked: false
  },
  {
    day: 98,
    title: "Launch EC2 in Private VPC Subnet Using Terraform",
    description: "xFusionCorp Industries needs EC2 instances in private subnets for their database tier for better security.\n\nTask:\nWrite a Terraform configuration that creates a private subnet (10.0.2.0/24) in the existing nautilus-vpc. Launch an EC2 instance in this private subnet. Ensure it has no direct internet access but can reach the internet via a NAT Gateway.\n\nHint: Create aws_subnet with map_public_ip_on_launch=false. Create aws_nat_gateway in a public subnet. Update the private route table to route 0.0.0.0/0 through the NAT Gateway.",
    locked: false
  },
  {
    day: 99,
    title: "Attach IAM Policy for DynamoDB Access Using Terraform",
    description: "xFusionCorp Industries needs their EC2 instances to access DynamoDB without storing credentials on disk.\n\nTask:\nWrite a Terraform configuration that creates an IAM Role with an EC2 trust policy. Attach an IAM Policy allowing full DynamoDB access. Create an Instance Profile and attach the role to the existing EC2 instance. Verify the instance can access DynamoDB.\n\nHint: Use aws_iam_role, aws_iam_role_policy, and aws_iam_instance_profile. Attach the profile to the EC2 instance via iam_instance_profile. Test with aws dynamodb list-tables from the instance.",
    locked: false
  },
  {
    day: 100,
    title: "Create and Configure Alarm Using CloudWatch Using Terraform",
    description: "Congratulations on reaching Day 100! xFusionCorp Industries needs CloudWatch monitoring set up for their EC2 infrastructure via Terraform.\n\nTask:\nWrite a Terraform configuration that creates a CloudWatch Alarm that triggers when the EC2 instance's CPUUtilization exceeds 80% for 5 minutes. Create an SNS Topic and subscribe an email address to it. Configure the alarm to send a notification to the SNS Topic on alarm state.\n\nHint: Use aws_cloudwatch_metric_alarm with comparison_operator: GreaterThanThreshold. Create aws_sns_topic and aws_sns_topic_subscription with protocol: email. Wire the alarm_actions to the SNS topic ARN.\n\n🎉 You have completed the 100-day DevOps challenge! Congratulations on your incredible journey!",
    locked: false
  }
];
