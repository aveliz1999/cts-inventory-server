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
    - name: docker
      image: docker:latest
      securityContext:
        privileged: true
      volumeMounts:
      - mountPath: /var/run/docker.sock
        name: docker-socket-volume
      tty: true
    - name: mysql
      image: mysql:8
      ports:
        - containerPort: 3306
      env:
        - name: MYSQL_ROOT_PASSWORD
          value: root
        - name: MYSQL_DATABASE
          value: database_test
    volumes:
      - name: docker-socket-volume
        hostPath:
          path: /var/run/docker.sock
          type: File
"""
        }
    }
    stages {
        stage('Publish') {
            steps {
                container('docker') {
                    script {
                        docker.withRegistry('https://registry.veliz99.com', 'veliz99-registry-credentials') {
                            def image = docker.build("cts-inventory-server:test-${BUILD_NUMBER}")
                            image.push()
                            image.push('latest')
                        }
                    }
                }
            }
        }
    }
}