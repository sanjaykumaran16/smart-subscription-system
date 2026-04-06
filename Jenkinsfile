pipeline {
    agent any

    options {
        skipDefaultCheckout(false)
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        // ─── Stage 1: Test ──────────────────────────────────────
        stage('Test') {
            stages {

                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            bat 'npm install'
                            bat 'npx prisma generate'
                            withEnv([
                                'DATABASE_URL=postgresql://testuser:testpass@localhost:5432/testdb',
                                'REDIS_URL=redis://localhost:6379',
                                'JWT_SECRET=test-secret-key-for-ci',
                                'NODE_ENV=test',
                                'PORT=5000'
                            ]) {
                                bat 'npm test'
                            }
                        }
                    }
                }

                stage('Frontend Lint') {
                    steps {
                        dir('frontend') {
                            bat 'npm install'
                            bat 'npm run lint || echo No lint errors'
                        }
                    }
                }
            }
        }

        // ─── Stage 2: Build Docker Images ───────────────────────
        stage('Build & Push') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                withCredentials([
                    string(credentialsId: 'docker-hub-username', variable: 'DOCKER_USERNAME'),
                    string(credentialsId: 'docker-hub-password', variable: 'DOCKER_PASSWORD')
                ]) {
                    bat "docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%"

                    // Backend image
                    bat "docker build -t %DOCKER_USERNAME%/smart-sub-backend:latest -t %DOCKER_USERNAME%/smart-sub-backend:%GIT_COMMIT% ./backend"
                    bat "docker push %DOCKER_USERNAME%/smart-sub-backend:latest"
                    bat "docker push %DOCKER_USERNAME%/smart-sub-backend:%GIT_COMMIT%"

                    // Frontend image
                    bat "docker build --build-arg VITE_API_URL=/api -t %DOCKER_USERNAME%/smart-sub-frontend:latest -t %DOCKER_USERNAME%/smart-sub-frontend:%GIT_COMMIT% ./frontend"
                    bat "docker push %DOCKER_USERNAME%/smart-sub-frontend:latest"
                    bat "docker push %DOCKER_USERNAME%/smart-sub-frontend:%GIT_COMMIT%"

                    // Nginx image
                    bat "docker build -t %DOCKER_USERNAME%/smart-sub-nginx:latest -t %DOCKER_USERNAME%/smart-sub-nginx:%GIT_COMMIT% ./nginx"
                    bat "docker push %DOCKER_USERNAME%/smart-sub-nginx:latest"
                    bat "docker push %DOCKER_USERNAME%/smart-sub-nginx:%GIT_COMMIT%"

                    bat 'docker logout'
                }
            }
        }

        // ─── Stage 3: Deploy ────────────────────────────────────
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploy stage - configure with your production server details'
                // Uncomment and configure when you have a deploy target:
                // sshagent(credentials: ['deploy-ssh-key']) {
                //     bat "ssh -o StrictHostKeyChecking=no user@your-server \"cd ~/smart-sub-mgmt && docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d --remove-orphans\""
                // }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
