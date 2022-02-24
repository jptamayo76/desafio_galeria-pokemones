const http = require('http');
const fs = require('fs');
const axios = require("axios");
const lodash = require('lodash');

async function getPokeLinks(url) {
    let { data } = await axios.get(url);
    return data.results;
}

async function getPokeData(url) {
    let { data } = await axios.get(url);
    return data;
}

http.createServer((req, res) => {
    if (req.url == '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.readFile('index.html', 'utf8', (err, html) => {
            res.end(html);
        });
    }
    if (req.url == '/pokemones') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        let pokemonesPromesas = [];

        Promise.all([
            getPokeLinks("https://pokeapi.co/api/v2/pokemon/?limit=20&offset=0"),
            getPokeLinks("https://pokeapi.co/api/v2/pokemon/?limit=20&offset=20"),
            getPokeLinks("https://pokeapi.co/api/v2/pokemon/?limit=20&offset=40"),
            getPokeLinks("https://pokeapi.co/api/v2/pokemon/?limit=20&offset=60"),
            getPokeLinks("https://pokeapi.co/api/v2/pokemon/?limit=20&offset=80"),
            getPokeLinks("https://pokeapi.co/api/v2/pokemon/?limit=20&offset=100"),
            getPokeLinks("https://pokeapi.co/api/v2/pokemon/?limit=20&offset=120"),
            getPokeLinks("https://pokeapi.co/api/v2/pokemon/?limit=11&offset=140")
        ])
            .then(resultado => {
                let linksArray = lodash.concat(
                    resultado[0],
                    resultado[1],
                    resultado[2],
                    resultado[3],
                    resultado[4],
                    resultado[5],
                    resultado[6],
                    resultado[7]
                );
                linksArray.forEach((p) => {
                    pokemonesPromesas.push(getPokeData(p.url));
                });

                Promise.all(pokemonesPromesas)
                    .then((data) => {
                        let finalResult = [];
                        data.forEach((p) => {
                            finalResult.push({ img: p.sprites.front_default, nombre: p.name })
                        })
                        res.write(JSON.stringify(finalResult));
                        res.end();
                    })
                    .catch(err => {
                        console.log("Error : ", err);
                    });

            })
            .catch(err => {
                console.log("Error : ", err);
            });
    }
}).listen(3000, () => console.log('Server listening on port 3000 with PID', process.pid));