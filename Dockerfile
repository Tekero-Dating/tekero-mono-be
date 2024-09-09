# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port on which the Nest.js application will run
EXPOSE 3000

RUN npm install -g sequelize-cli

CMD ["sh", "-c", "npm run build && npm run seed:dev && npm run start:dev"]
