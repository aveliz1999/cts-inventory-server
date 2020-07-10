pipeline {
    agent any
    stages {
        container('node:14') {
            stage('Test') {
                sh 'npm test'
            }
        }
    }
}