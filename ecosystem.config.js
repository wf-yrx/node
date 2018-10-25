module.exports = {
  apps : [{
    name: 'node-test',
    script: './app.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    args: 'one two',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
        user : 'yueyagou',
        host : '47.107.74.126',
        ref  : 'origin/master',
        port : '12178',
        repo : 'git@github.com:wf-yrx/node.git',
        path : '/home/yueyagou/www/wf',
        ssh_options: "StrictHostKeyChecking=no",
        env : {
            "NODE_ENV": "production"
        },
        'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
