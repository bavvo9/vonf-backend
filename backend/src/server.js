const app = require ('./app');

app.get('/', (req, res) => { //end point de prueba 
  res.send('API VONF funcionando');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});