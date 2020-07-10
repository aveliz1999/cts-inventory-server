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
      image: mysql:asd
      tty: true
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