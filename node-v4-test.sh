# modify the configuration for testing under Node v4
# requires installing some earlier versions of dev dependencies

npm rm ts-node && npm i -D ts-node@7
npm rm ava && npm i -D ava@0.15.2

rm -rf build
./node_modules/.bin/tsc
./node_modules/.bin/ava build/test

echo 'run git reset --hard HEAD to undo all the changes'
