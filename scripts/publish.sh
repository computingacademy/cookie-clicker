#!/bin/bash
# Create version directory
mkdir $1

# Copy files
cp index.html $1
for dir in css images js font blockly; do
  cp -r $dir $1/$dir
done

# Compile es6
./scripts/compile-es6.sh $1

# Add to gh-pages branch
BRANCH="$(git name-rev --name-only HEAD)"
git stash
git checkout gh-pages
git pull
git add $1
git commit -m "Added $1"
git push
git checkout $BRANCH 
git stash pop
