pipeline {
    agent any
    environment {
        image = 'cts-inventory-server'
    }
    stages {

        stage('Publish') {
            environment {
                DOCKER_PATH = tool 'docker'
                DOCKER_CREDS = credentials('veliz99-registry-credentials')
            }
            steps {
                script {
                    sh '${DOCKER_PATH} login --username ${DOCKER_CREDS_USR} --password ${DOCKER_CREDS_PSW} https://registry.veliz99.com'
                    sh 'docker build -t ${image}-testing-${BUILD_NUMBER} -t latest .'
                    sh 'docker push https://registry.veliz99.com'
                }
            }
        }
    }
}