pipeline {
    agent any
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