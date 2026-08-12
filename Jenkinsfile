// Declarative Jenkins Pipeline
// Triggered by GitHub Actions via Generic Webhook Trigger plugin
// Stages: Checkout → Build WAR → Deploy to Tomcat → Notify

pipeline {
    agent any

    // ── Environment variables ──────────────────────────────────────
    environment {
        // WAR file details (must match pom.xml artifactId + version)
        APP_NAME        = 'devops-roadmap'
        WAR_VERSION     = '1.0.3'
        WAR_FILE        = "${APP_NAME}-${WAR_VERSION}.war"

        // Tomcat deployment path on this EC2 (adjust if different)
        TOMCAT_WEBAPPS  = '/opt/tomcat/webapps'

        // GitHub repo (used for checkout)
        REPO_URL        = 'https://github.com/NaYa-World/90days-devops-2week.git'
    }

    // ── Build triggers ─────────────────────────────────────────────
    triggers {
        // Generic Webhook Trigger — called by GitHub Actions Stage 3
        // Plugin: https://plugins.jenkins.io/generic-webhook-trigger/
        GenericTrigger(
            genericVariables: [],
            causeString   : 'Triggered by GitHub Actions after successful build',
            token         : env.JENKINS_WEBHOOK_TOKEN,  // set as Jenkins env var or credential
            printContributedVariables: true,
            printPostContent: false,
            silentResponse: false
        )
    }

    options {
        // Keep last 5 builds
        buildDiscarder(logRotator(numToKeepStr: '5'))
        // Fail if build takes longer than 20 minutes
        timeout(time: 20, unit: 'MINUTES')
        // Add timestamps to console output
        timestamps()
    }

    stages {

        // ── Stage 1: Checkout ──────────────────────────────────────
        stage('📥 Checkout') {
            steps {
                echo "╔══════════════════════════════════╗"
                echo "║  Checking out from GitHub...     ║"
                echo "╚══════════════════════════════════╝"
                git branch: 'main', url: "${env.REPO_URL}"
            }
        }

        // ── Stage 2: Build WAR ─────────────────────────────────────
        stage('🏗️ Maven Build') {
            steps {
                echo "╔══════════════════════════════════╗"
                echo "║  Building WAR with Maven...      ║"
                echo "╚══════════════════════════════════╝"
                // -DskipTests: tests already verified by GitHub Actions
                sh 'mvn clean package -DskipTests --batch-mode'
                echo "WAR built: target/${WAR_FILE}"
            }
        }

        // ── Stage 3: Deploy WAR to Tomcat ─────────────────────────
        stage('🚀 Deploy to Tomcat') {
            steps {
                echo "╔══════════════════════════════════╗"
                echo "║  Deploying WAR to Tomcat...      ║"
                echo "╚══════════════════════════════════╝"
                script {
                    // Remove old deployment if it exists
                    sh """
                        if [ -f ${TOMCAT_WEBAPPS}/${WAR_FILE} ]; then
                            echo "Removing old WAR..."
                            sudo rm -f ${TOMCAT_WEBAPPS}/${WAR_FILE}
                            sudo rm -rf ${TOMCAT_WEBAPPS}/${APP_NAME}-${WAR_VERSION}
                        fi
                    """
                    // Copy new WAR to Tomcat webapps
                    sh "sudo cp target/${WAR_FILE} ${TOMCAT_WEBAPPS}/"
                    echo "Deployed ${WAR_FILE} to ${TOMCAT_WEBAPPS}"

                    // Wait for Tomcat to auto-unpack (5 seconds)
                    sh 'sleep 5'
                    echo "✅ Tomcat deployment complete!"
                }
            }
        }

        // ── Stage 4: Smoke Test ─────────────────────────────────────
        stage('🔍 Smoke Test') {
            steps {
                echo "╔══════════════════════════════════╗"
                echo "║  Running smoke test...           ║"
                echo "╚══════════════════════════════════╝"
                script {
                    // Check the app returns HTTP 200
                    def status = sh(
                        script: "curl --silent --output /dev/null --write-out '%{http_code}' http://localhost:8090/${APP_NAME}-${WAR_VERSION}/",
                        returnStdout: true
                    ).trim()
                    echo "HTTP Status: ${status}"
                    if (status != '200') {
                        error("Smoke test FAILED — expected 200, got ${status}")
                    }
                    echo "✅ Smoke test passed! App is live."
                }
            }
        }
    }

    // ── Post-build actions ─────────────────────────────────────────
    post {
        success {
            echo """
╔══════════════════════════════════════════════════════════╗
║  ✅ BUILD SUCCESS                                        ║
║  App: http://<your-ec2-ip>:8090/${APP_NAME}-${WAR_VERSION}/  ║
╚══════════════════════════════════════════════════════════╝
            """
        }
        failure {
            echo """
╔══════════════════════════════════╗
║  ❌ BUILD FAILED                 ║
║  Check the console output above  ║
╚══════════════════════════════════╝
            """
        }
        always {
            // Archive the WAR for traceability
            archiveArtifacts artifacts: 'target/*.war', allowEmptyArchive: true
        }
    }
}
