module.exports = {
  apps: [{
    name: 'retina_prod',
    script: './server/app.js',
    instances: 'max',
    exec_mode: 'cluster',
  }],
};
