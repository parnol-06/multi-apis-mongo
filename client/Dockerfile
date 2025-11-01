# Etapa 1: construir la app
FROM node:18 AS build

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de proyecto
COPY package*.json ./
RUN npm install

COPY . .

# Compila la app para producción
RUN npm run build

# Etapa 2: servir con Nginx
FROM nginx:alpine

# Copia los archivos generados al contenedor Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copia la configuración por defecto de Nginx (opcional)
# Puedes personalizar el routing de React si usas react-router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80
EXPOSE 80

# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]
