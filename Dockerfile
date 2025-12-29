# Dockerfile para Frontend React - Sistema de Monitoreo Médico
# Multi-stage build para producción

# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Argumento para la URL del backend (se pasa en build time)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Construir la aplicación
RUN npm run build

# Etapa 2: Servir con nginx
FROM nginx:alpine

# Copiar el build al directorio de nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run usa puerto 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
