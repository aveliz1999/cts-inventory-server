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
"""
        }
    }
    stages {
        stage('Test') {
            steps {
                container('node:14') {
                    sh 'npm test'
                }
            }
        }
    }
}