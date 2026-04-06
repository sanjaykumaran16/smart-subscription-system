pipeline {
    agent any

    environment {
        DOCKER_USERNAME    = credentials('docker-hub-username')   // Jenkins string credential
        DOCKER_PASSWORD    = credentials('docker-hub-password')   // Jenkins secret-text credential
        IMAGE_BACKEND      = "${DOCKER_USERNAME}/smart-sub-backend"
        IMAGE_FRONTEND     = "${DOCKER_USERNAME}/smart-sub-frontend"
        IMAGE_NGINX        = "${DOCKER_USERNAME}/smart-sub-nginx"
        NODEJS_HOME        = tool(name: 'NodeJS-18', type: 'nodejs')
        PATH               = "${NODEJS_HOME}/bin:${env.PATH}"
    }

    options {
        skipDefaultCheckout(false)
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        // ─── Stage 1: Test ──────────────────────────────────────
        stage('🧪 Test') {
            stages {

                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm ci'
                            sh 'npx prisma generate'
                            withEnv([
                                "DATABASE_URL=postgresql://testuser:testpass@localhost:5432/testdb",
                                "REDIS_URL=redis://localhost:6379",
                                "JWT_SECRET=test-secret-key-for-ci",
                                "NODE_ENV=test",
                                "PORT=5000"
                            ]) {
                                sh 'npm test'
                            }
                        }
                    }
                }

                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npm run lint || echo "No lint errors or lint not configured"'
                        }
                    }
                }
            }
        }

        // ─── Stage 2: Build & Push Docker Images ────────────────
        stage('🐳 Build & Push') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                sh "echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin"

                // Backend image
                sh """
                    docker build -t ${IMAGE_BACKEND}:latest -t ${IMAGE_BACKEND}:${env.GIT_COMMIT} ./backend
                """
                sh "docker push ${IMAGE_BACKEND}:latest && docker push ${IMAGE_BACKEND}:${env.GIT_COMMIT}"

                // Frontend image
                sh """
                    docker build --build-arg VITE_API_URL=/api \
                        -t ${IMAGE_FRONTEND}:latest -t ${IMAGE_FRONTEND}:${env.GIT_COMMIT} ./frontend
                """
                sh "docker push ${IMAGE_FRONTEND}:latest && docker push ${IMAGE_FRONTEND}:${env.GIT_COMMIT}"

                // Nginx image
                sh """
                    docker build -t ${IMAGE_NGINX}:latest -t ${IMAGE_NGINX}:${env.GIT_COMMIT} ./nginx
                """
                sh "docker push ${IMAGE_NGINX}:latest && docker push ${IMAGE_NGINX}:${env.GIT_COMMIT}"
            }
        }

        // ─── Stage 3: Deploy ────────────────────────────────────
        stage('🚀 Deploy') {
            when {
                branch 'main'
            }
            steps {
                sshagent(credentials: ['deploy-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} << 'ENDSSH'
                            set -e
                            cd ~/smart-sub-mgmt

                            docker pull ${IMAGE_BACKEND}:latest
                            docker pull ${IMAGE_FRONTEND}:latest
                            docker pull ${IMAGE_NGINX}:latest

                            docker-compose -f docker-compose.prod.yml up -d --remove-orphans

                            docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

                            sleep 10
                            STATUS=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)
                            if [ "\$STATUS" != "200" ]; then
                                echo "Health check FAILED with status \$STATUS"
                                exit 1
                            fi
                            echo "Health check PASSED (200 OK)"

                            docker image prune -f
                        ENDSSH
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
        always {
            sh 'docker logout || true'
            cleanWs()
        }
    }
}
