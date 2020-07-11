pipeline {
    agent any
    environment {
        image = 'cts-inventory-server'
        DOCKER_PATH = tool 'docker'
    }
    stages {

        stage('Publish') {
            environment {
                PATH = sh 'echo "${PATH}:$(dirname ${DOCKER_PATH})"'
            }
            steps {
                sh 'echo ${PATH}'
                script {
                    docker.withRegistry('https://registry.veliz99.com', 'veliz99-registry-credentials') {
                        def image = docker.build("${image}:test-${BUILD_NUMBER}")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
    }
}