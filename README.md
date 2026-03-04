This is a demo project written in NextJS. It uses prisma for ORM (which means connects to database)

# Run on your local machine

- Step 1, clone this project to your local machine and within the project root folder 
  install dependencies
```bash
npm i
```
- Step 2, setup database of sqlite (which is just an in 
memory database only for the ease of testing)
    - make sure the prisma/schema.prisma file has this
  ```c
    datasource db {
      provider = "sqlite" 
      url      = env("DATABASE_URL")     
    }
  ```
    - Then Run a migration to create your database tables with Prisma Migrate
    ```bash
    npx prisma migrate dev --name init
    ```
- Step 3, run dev server to serve the NextJS web app
    ```bash
    npm run dev
    ```

# Run on aws ec2 with a mysql RDS

- Step 0, fire up ec2 and mysql rds, set up correctly with their security rules
    > By default, nextjs dev server run on port 3000 of http, so allow it's request
- Step 1, clone this project to the ec2 and within the project root folder
  install dependencies
```bash
npm i
```
- Step 2, setup database of mysql rds 
    - ***make sure the prisma/schema.prisma file has this***
  ```c
    datasource db {
      provider = "mysql" 
      url      = "mysql://USER:PASSWORD@HOST:PORT/DATABASE"  
    }
  ```
  > Change the USER, PASSWORD, PORT and DATABASE of your mysql rds, specifically
  > you have to have an existing DATABSE within mysql. 
  > Tables can be created by prisma

    - Then Run a migration to create your database tables with Prisma Migrate
    ```bash
    npx prisma migrate dev --name init
    ```
- Step 3, run dev server to serve the NextJS web app
    ```bash
    npm run dev
    ```


##