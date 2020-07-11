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
    stages {
        stage('Test') {
            steps {
                container('node') {
                    sh 'wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh'
                    sh 'chmod +x wait-for-it.sh'
                    sh './wait-for-it.sh localhost:3306 -t 120'
                    sh 'npm ci'
                    sh 'node ${WORKSPACE}/jenkins/setupConfigs.js'
                    sh 'npm test'
                }
            }
        }
    }
}