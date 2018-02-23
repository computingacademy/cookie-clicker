#!/bin/bash
npm install --save-dev babel-cli babel-preset-env babel-preset-es2015
./node_modules/.bin/babel $1/js -d $1/js
