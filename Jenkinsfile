pipeline {
    agent any

    options {
        skipDefaultCheckout(false)
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Backend Install') {
            steps {
                dir('backend') {
                    bat 'npm install'
                    bat 'npx prisma generate'
                }
            }
        }

        stage('Backend Test') {
            steps {
                dir('backend') {
                    withEnv([
                        'DATABASE_URL=postgresql://testuser:testpass@localhost:5432/testdb',
                        'REDIS_URL=redis://localhost:6379',
                        'JWT_SECRET=test-secret-key-for-ci',
                        'NODE_ENV=test',
                        'PORT=5000'
                    ]) {
                        bat 'npx jest --passWithNoTests --forceExit --detectOpenHandles'
                    }
                }
            }
        }

        stage('Frontend Install & Lint') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                    bat 'npm run lint || exit 0'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker build -t smart-sub-backend:latest ./backend'
                bat 'docker build --build-arg VITE_API_URL=/api -t smart-sub-frontend:latest ./frontend'
                bat 'docker build -t smart-sub-nginx:latest ./nginx'
            }
        }

        stage('Docker Compose Up') {
            steps {
                bat 'docker-compose -f docker-compose.yml up -d --build'
                bat 'ping -n 16 127.0.0.1 > nul'
                bat 'docker-compose ps'
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
        always {
            bat 'docker-compose -f docker-compose.yml down || exit 0'
        }
    }
}
