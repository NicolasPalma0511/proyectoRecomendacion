FROM node:16

WORKDIR /app
COPY package*.json ./

RUN npm install --legacy-peer-deps \
    && npm install -g @expo/ngrok@4.1.0

COPY . .
ENV REACT_APP_API_URL=http://ec2-3-93-213-23.compute-1.amazonaws.com:5000

EXPOSE 19000 19001 19002 3000

CMD ["npx", "expo", "start", "--tunnel"]
