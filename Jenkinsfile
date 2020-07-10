pipeline {
    agent any
    stages {
        stage('Test') {
            container('node:14') {
                sh 'npm test'
            }
        }
    }
}