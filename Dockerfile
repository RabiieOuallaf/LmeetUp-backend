# Base image 
FROM node:20.10.0

# Set the working directory in the container 
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./ 

# install the dependencies 

RUN npm install

# Copy the project files 

COPY . . 

EXPOSE 3000

CMD ["npm", "start"]

