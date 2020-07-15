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
        stage('Publish') {
            steps {
                container('docker') {
                    script {
                        docker.withRegistry('https://registry.veliz99.com', 'veliz99-registry-credentials') {
                            def image = docker.build("cts-inventory-server:${BRANCH_NAME}-${BUILD_NUMBER}")
                            image.push()
                            image.push('latest')
                        }
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                sh 'curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.18.5/bin/linux/amd64/kubectl'

                sh 'chmod +x ./kubectl'
                withKubeConfig([credentialsId: 'kubernetes-service-account']) {
                    script {
                        // Create a persistent volume claim for the database if one doesn't exist for this branch
                        sh './kubectl get PersistentVolumeClaim cts-inventory-${BRANCH_NAME}-database -n cts-inventory || sed "s/REPLACEME_NAME/cts-inventory-${BRANCH_NAME}-database/g" ./jenkins/claim.yaml | ./kubectl apply -f -'
                        // Create a database password secret if one doesn't exist for this branch
                        sh './kubectl get Secret cts-inventory-${BRANCH_NAME}-database -n cts-inventory || sed "s/REPLACEME_NAME/cts-inventory-${BRANCH_NAME}-database/g; s/REPLACEME_PASSWORD/$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32 ; echo "")/g" ./jenkins/secret.yaml | ./kubectl apply -f -'
                        // Create a database deployment if one doesn't exist for this branch
                        sh './kubectl get Deployment cts-inventory-${BRANCH_NAME}-database -n cts-inventory || sed "s/REPLACEME_NAME/cts-inventory-${BRANCH_NAME}-database/g" ./jenkins/database.yaml | ./kubectl apply -f -'
                        // Expose the database deployment for this branch if it isn't already
                        sh './kubectl get Service cts-inventory-${BRANCH_NAME}-database -n cts-inventory || ./kubectl expose deployment cts-inventory-${BRANCH_NAME}-database -n cts-inventory'

                        // Create a persistent volume claim for redis if one doesn't exist for this branch
                        sh './kubectl get PersistentVolumeClaim cts-inventory-${BRANCH_NAME}-redis -n cts-inventory || sed "s/REPLACEME_NAME/cts-inventory-${BRANCH_NAME}-redis/g" ./jenkins/claim.yaml | ./kubectl apply -f -'
                        // Create a redis deployment for this branch if it doesn't exist already
                        sh './kubectl get Deployment cts-inventory-${BRANCH_NAME}-redis -n cts-inventory || sed "s/REPLACEME_NAME/cts-inventory-${BRANCH_NAME}-redis/g" ./jenkins/redis.yaml | ./kubectl apply -f -'
                        // Expose the redis deployment for this branch if it isn't already
                        sh './kubectl get Service cts-inventory-${BRANCH_NAME}-redis -n cts-inventory || ./kubectl expose deployment cts-inventory-${BRANCH_NAME}-redis -n cts-inventory'

                        // Create a ConfigMap for the server configurations for this branch if one doesn't exist already
                        sh './kubectl get ConfigMap cts-inventory-${BRANCH_NAME}-server -n cts-inventory || sed "s/REPLACEME_NAME/cts-inventory-${BRANCH_NAME}-server/g; s/REPLACEME_ENVIRONMENT/${BRANCH_NAME}/g; s/REPLACEME_PASSWORD/$(kubectl get secret cts-inventory-${BRANCH_NAME}-database -n cts-inventory --template={{.data.password}})/g; s/REPLACEME_SESSION_PASSWORD/$(kubectl get secret cts-inventory-${BRANCH_NAME}-database -n cts-inventory --template={{.data.password}})/g" ./jenkins/configMap.yaml | ./kubectl apply -f -'

                        sh './kubectl set image deployment cts-inventory-${BRANCH_NAME}-server registry.veliz99.com/cts-inventory-server:${BRANCH_NAME}-${BUILD_NUMBER} -n cts-inventory || sed "s/REPLACEME_NAME/cts-inventory-${BRANCH_NAME}-server/g; s/REPLACEME_IMAGE/registry.veliz99.com\\/cts-inventory-server:${BRANCH_NAME}-${BUILD_NUMBER}/g; s/REPLACEME_ENVIRONMENT/${BRANCH_NAME}/g; s/REPLACEME_CONFIG/cts-inventory-${BRANCH_NAME}-server/g; s/REPLACEME_HOST_DATABASE/cts-inventory-${BRANCH_NAME}-database/g; s/REPLACEME_HOST_REDIS/cts-inventory-${BRANCH_NAME}-redis/g" ./jenkins/deployment.yaml | ./kubectl apply -f -'

                        // Expose the server deployment for this branch if it isn't already
                        sh './kubectl get Service cts-inventory-${BRANCH_NAME}-server -n cts-inventory || ./kubectl expose deployment cts-inventory-${BRANCH_NAME}-server -n cts-inventory'
                        // Expose an ingress for this branch if it doesn't have on already
                        sh './kubectl get ingress cts-inventory-${BRANCH_NAME} -n cts-inventory || sed "s/REPLACEME_NAME/cts-inventory-${BRANCH_NAME}/g; s/REPLACEME_HOST/${BRANCH_NAME}.cts-inventory.${DOMAIN}/g; s/REPLACEME_SERVICE/cts-inventory-${BRANCH_NAME}-server/g" ./jenkins/ingress.yaml | ./kubectl apply -f -'
                    }
                }
            }
        }
    }
}