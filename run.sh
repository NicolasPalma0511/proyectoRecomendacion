#!/bin/bash

# Variables para los nodos
WORKER_NODES=("IP_NODO_TRABAJADOR_1" "IP_NODO_TRABAJADOR_2")

# Inicializar Docker Swarm
if ! docker info | grep -q 'Swarm: active'; then
    echo "Inicializando Docker Swarm en el nodo principal..."
    docker swarm init
else
    echo "Docker Swarm ya está activo."
fi

WORKER_TOKEN=$(docker swarm join-token -q worker)
MANAGER_IP=$(hostname -I | awk '{print $1}')
echo "Token de trabajador: $WORKER_TOKEN"
echo "IP del nodo principal: $MANAGER_IP"

# Unir los nodos trabajadores al Swarm y construir las imágenes en cada nodo
for NODE in "${WORKER_NODES[@]}"; do
    echo "Uniendo el nodo $NODE al Swarm..."
    ssh root@$NODE "docker swarm join --token $WORKER_TOKEN $MANAGER_IP:2377"

    echo "Copiando archivos al nodo $NODE..."
    scp -r ./app ./react/MiProyecto root@$NODE:/tmp/

    echo "Construyendo la imagen para el servicio web en $NODE..."
    ssh root@$NODE "docker build -t myapp_web -f /tmp/app/Dockerfile /tmp/app"

    echo "Construyendo la imagen para el servicio frontend en $NODE..."
    ssh root@$NODE "docker build -t myapp_frontend -f /tmp/react/MiProyecto/Dockerfile /tmp/react/MiProyecto"
done

# Construir las imágenes en el nodo principal
echo "Construyendo la imagen para el servicio web en el nodo principal..."
docker build -t myapp_web -f app/Dockerfile ./app

echo "Construyendo la imagen para el servicio frontend en el nodo principal..."
docker build -t myapp_frontend -f react/MiProyecto/Dockerfile ./react/MiProyecto

# Actualizar apiUrl en los archivos React
APP_JS_PATH="react/MiProyecto/App.js"
DETAIL_SCREEN_PATH="react/MiProyecto/DetailScreen.js"

echo "Actualizando apiUrl en $APP_JS_PATH..."
sed -i "s|const apiUrl = 'http://ec2-18-204-207-102.compute-1.amazonaws.com:5000';|const apiUrl = 'http://$MANAGER_IP:5000';|g" $APP_JS_PATH

echo "Actualizando apiUrl en $DETAIL_SCREEN_PATH..."
sed -i "s|const apiUrl = 'http://ec2-18-204-207-102.compute-1.amazonaws.com:5000';|const apiUrl = 'http://$MANAGER_IP:5000';|g" $DETAIL_SCREEN_PATH

# Desplegar la pila de servicios con Docker Stack en el nodo principal
echo "Desplegando servicios con Docker Stack..."
docker stack deploy -c docker-compose.yml sistemaR

echo "Despliegue completo."
