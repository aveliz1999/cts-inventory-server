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
    - name: mysql
      image: mysql:8
      ports:
        - containerPort: 3306
      env:
        - name: MYSQL_ROOT_PASSWORD
          value: root
"""
        }
    }
    stages {
        stage('Test') {
            steps {
                container('node') {
                    sh 'npm ci'
                    sh 'node ${WORKSPACE}/jenkins/setupConfigs.js'
                    sh 'npm test'
                }
            }
        }
    }
}