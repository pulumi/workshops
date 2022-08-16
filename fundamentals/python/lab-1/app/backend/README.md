<h1> 
  Pulumipus Boba Tea Shop Demo using React and Express
</h1>

> MERN Shopping cart created with React, NodeJS, MongoDB
> 
> Forked from https://github.com/shubhambattoo/shopping-cart 

## Prerequisites

If you are running from the tutorials, all you need is Pulumi and Docker. See
[the start of the Docker lab](../README.md#Prerequistes) for more information.

If you're running this app locally without the tutorial, you need the following tools:

* NodeJS 12+
* MongoDB installed locally
* npm or yarn

## Getting Started

Clone or Download

```sh
git clone https://github.com/pulumi/tutorials.git
cd tutorials/introduction-to-pulumi/docker/app/backend
```

Run `npm install` to install all the dependencies

Create a .env file:

```txt
PORT=3000
DATABASE_HOST=mongodb://yoururl/
DATABASE_NAME=yourDBNAME
NODE_ENV=development
```

To import the mock product data to MongoDB, run the following command in your terminal from the app root:

```sh
cd /data
mongoimport --db [yourDBName] --collection products --file products.json --jsonArray
```

To start up the backend services, run `npm start`. This command will start the backend service on port 3000.

## Client Side

Development

```
cd client
npm install
npm start
```

This should start up the React application on port 3001.

To view the web app, open [http://localhost:3001](http://localhost:3001).

## Contributing

Contributions, issues and feature requests are welcome!
Feel free to check [issues](https://github.com/pulumi/tutorials/issues) page.

View [CONTRIBUTING.md](https://github.com/pulumi/tutorials/blob/master/CONTRIBUTING.md) to learn about the style guide, folder structure, scripts, and how to contribute.

## Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://www.shubhambattoo.in">
        <img src="https://avatars1.githubusercontent.com/u/21199053?s=460&u=b41bc8b601833787049d7a35fe981bcf56741c18&v=4" width="50px;" alt=""/>
        <br />
        <sub>
          <b>Shubham Battoo</b>
        </sub>
      </a>
      <br />
      <a href="https://github.com/pulumi/tutorials/commits/master?author=shubhambattoo" title="Code">💻</a>
      <a href="https://github.com/pulumi/tutorials/commits/master?author=shubhambattoo" title="Documentation">📖</a>
      <a href="#infra-shubhambattoo" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a>
    </td>
    <td align="center">
      <a href="https://www.manojbarman.in/">
        <img src="https://avatars2.githubusercontent.com/u/11155266?s=460&u=1109fa72a8f0652ed20c58b10391ed49f7162ef5&v=4" width="50px;" alt=""/>
        <br />
        <sub>
          <b>Manoj Barman</b>
        </sub>
      </a>
      <br />
      <a href="https://github.com/pulumi/tutorials/commits/master?author=itsmanojb" title="Code">💻</a>
    </td>
    <td align="center">
      <a href="https://www.twitter.com/spara">
        <img src="https://avatars.githubusercontent.com/u/638672?v=4" width="50px;" alt=""/>
        <br />
        <sub>
          <b>Sophia Parafina</b>
        </sub>
      </a>
      <br />
      <a href="https://github.com/pulumi/tutorials/commits/master?author=spara" title="Code">💻</a>
      <a href="https://github.com/pulumi/tutorials/commits/master?author=spara" title="Documentation">📖</a>
    </td>
    <td align="center">
      <a href="https://nimbinatus.com">
        <img src="https://avatars.githubusercontent.com/u/1538692?v=4" width="50px;" alt=""/>
        <br />
        <sub>
          <b>Laura Santamaria</b>
        </sub>
      </a>
      <br />
      <a href="https://github.com/pulumi/tutorials/commits/master?author=nimbinatus" title="Code">💻</a>
      <a href="https://github.com/pulumi/tutorials/commits/master?author=nimbinatus" title="Documentation">📖</a>
    </td>
  </tr>
</table>

## Show your support

Give a ⭐️ if this project helped you!
