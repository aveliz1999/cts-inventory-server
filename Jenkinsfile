pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
    containers:
    - name: node
      image: node:14
      tty: true
    - name: redis
      image: redis:6
    - name: mysql
      image: mysql:8
      ports:
        - containerPort: 3306
      env:
        - name: MYSQL_ROOT_PASSWORD
          value: root
        - name: MYSQL_DATABASE
          value: database_test
"""
        }
    }
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