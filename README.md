# Final Year Project Backend Nodejs

This is a project we did for our final year in AAiT.

# Title

Next Generation University ERP System (Property Administration System)

# Prepared By

- Abdulhamid Mussa ATR/3656/10
- Bemnet Teklu ATR/3381/10
- Lensa Billion ATR/0852/10
- Mahlet Dereje ATR/1931/10
- Nebyu Tsegaye ATR/2127/10

# Advisor

Mr. Wondimagegn Desta

# Summary

Auditing a system is an important part of an application that deals with transactions. The project aimed to provide a sense of confidence on the validity and integrity of the transactions that are happening within the system using the blockchain technology. The Audit Trail implementation is one of the core features this project wanted to demonstrate.

# Tools and Technologies used to develop the system

- Nodejs
- Express
- Mongodb
- Alchemy

# Installation / Setup and Running Steps

After cloning the repo, this are the steps to follow in order run it:

1. prepare a _.env file_ with the following template:

- REFRESH_TOKEN_SECRET =
- ACCESS_TOKEN_SECRET =
- MONGODB_URL_LOCAL =
- MONGODB_URL_ONLINE =
- PRIVATE_KEY =
- CONTRACT_ADDRESS =
- ALCHEMY_URL =
- ALCHEMY_KEY =

2. npm install
   - ![installing the packages](/assets/screenshots/install_backend_packages.PNG)
3. npm run dev
   - ![running the project](/assets/screenshots/run_the_project.PNG)

# References

1. MERN Auth Tutorial, https://www.youtube.com/watch?v=npsi7ZkjvQo, Nov 2021
2. Ethers tutorial, https://www.youtube.com/watch?v=yk7nVp5HTCk, March 2022
