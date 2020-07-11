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
                    sh 'chmod +x ${DOCKER_PATH}'
                    sh 'echo ${DOCKER_CREDS_USR}'
                    sh 'echo ${DOCKER_CREDS_PSW}'
                    sh '${DOCKER_PATH} login --username ${DOCKER_CREDS_USR} --password ${DOCKER_CREDS_PSW} https://registry.veliz99.com'
                    sh '${DOCKER_PATH} build -t ${image}-testing-${BUILD_NUMBER} -t latest .'
                    sh '${DOCKER_PATH} push https://registry.veliz99.com'
                }
            }
        }
    }
}