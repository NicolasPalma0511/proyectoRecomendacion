import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import { ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DetailScreen from './DetailScreen';


const Stack = createStackNavigator();

const PARTITURAS_POR_PAGINA = 5;

function HomeScreen({ navigation }) {
  const [sheets, setSheets] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    const apiUrl = 'http://ec2-18-204-207-102.compute-1.amazonaws.com:5000';
    fetch(`${apiUrl}/partituras`)
      .then(response => response.json())
      .then(data => setSheets(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  // Función para dividir las partituras por página
  const obtenerPartiturasPorPagina = () => {
    const inicio = (paginaActual - 1) * PARTITURAS_POR_PAGINA;
    const fin = inicio + PARTITURAS_POR_PAGINA;
    return sheets.slice(inicio, fin);
  };

  // Calcular el total de páginas
  const totalPaginas = Math.ceil(sheets.length / PARTITURAS_POR_PAGINA);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.sheetItem}
      onPress={() => navigation.navigate('Detalles', { sheetId: item.id })}
    >
      <Text style={styles.sheetTitle}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  const cambiarPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Image
          source={require('./assets/logo.jpg')}
          style={styles.logo}
        />
        <View style={styles.nav}>
          <TouchableOpacity><Text style={styles.navItem}>SoloGuitar</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navItem}>Tutoriales</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navItem}>Academias afiliadas</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.navItem}>Canciones</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Partituras</Text>
      
      {/* Lista de partituras para la página actual */}
      <FlatList
        data={obtenerPartiturasPorPagina()}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={{ flex: 1, paddingHorizontal: 10 }}
        contentContainerStyle={{
          paddingVertical: 10,
        }}
        showsVerticalScrollIndicator={false} 
      />



      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.pagination}>
          <TouchableOpacity onPress={() => cambiarPagina(paginaActual - 1)}>
            <Text style={styles.paginationButton}>Anterior</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>Página {paginaActual} de {totalPaginas}</Text>
          <TouchableOpacity onPress={() => cambiarPagina(paginaActual + 1)}>
            <Text style={styles.paginationButton}>Siguiente</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>


      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <View style={styles.footerIcons}>
            <TouchableOpacity><Image source={require('./assets/tiktok.png')} style={styles.icon} /></TouchableOpacity>
            <TouchableOpacity><Image source={require('./assets/instagram.png')} style={styles.icon} /></TouchableOpacity>
          </View>
          <View style={styles.footerLinks}>
            <TouchableOpacity><Text style={styles.footerText}>Términos y condiciones</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.footerText}>Política de seguridad</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.footerText}>Política de privacidad</Text></TouchableOpacity>
          </View>
        </View>
        <Text style={styles.copyright}>Copyright SoloGuitar 2024 - 2024 © Todos los derechos reservados</Text>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Inicio" component={HomeScreen} />
        <Stack.Screen name="Detalles" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#000',
    padding: 10
  },
  logo: { width: 80, height: 80 },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
  },
  paginationButton: {
    fontSize: 18,
    marginHorizontal: 20,
    paddingVertical: 10, // Más relleno vertical
    paddingHorizontal: 20, // Más relleno horizontal
    color: '#fff', // Letras en blanco
    backgroundColor: '#f48024', // Fondo del botón
    borderRadius: 5,
    minWidth: 100, // Asegura que los botones sean más anchos
    textAlign: 'center',
  },
// Contenedor principal de la lista de partituras
containerPartituras: {
  flex: 1,
  padding: 20,
  marginBottom: 20, // Aumenta el margen inferior
  backgroundColor: '#f5f5f5', // Fondo claro para visibilidad
  marginHorizontal: 20, // Añadir margen horizontal para que la lista sea más ancha
},
   // Estilo de los elementos (partituras)
   itemPartitura: {
    padding: 25, // Aumenta el relleno dentro de cada partitura
    marginBottom: 20, // Agrega más espacio entre cada partitura
    backgroundColor: '#fff',
    borderRadius: 10, // Bordes más redondeados
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Aumenta la sombra
    shadowOpacity: 0.2,
    shadowRadius: 10, // Aumenta la intensidad de la sombra
    height: 120, // Ajusta la altura de cada item
    width: '100%', // Asegura que cada item ocupe todo el ancho disponible
  },
 // Paginación: Espaciado adecuado entre los botones
 pagination: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: 30, // Mayor espacio por encima
  marginBottom: 30, // Mayor espacio por debajo
},
  pageInfo: { fontSize: 18, alignSelf: 'center', marginHorizontal: 10 },
  navItem: { color: '#fff', fontSize: 18, marginHorizontal: 10 },
  loginButton: { backgroundColor: '#f48024', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  loginText: { color: '#fff', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 20, textAlign: 'center', color: '#fff' },
  sheetItem: { padding: 15, backgroundColor: '#ccc', marginBottom: 10, borderRadius: 5 },
  sheetTitle: { fontSize: 18 },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  pageInfo: { fontSize: 18, alignSelf: 'center', color: '#fff' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#000', paddingVertical: 20, paddingHorizontal: 10, alignItems: 'center' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: Dimensions.get('window').width * 0.9, marginBottom: 10 },
  footerIcons: { flexDirection: 'row', justifyContent: 'flex-start' },
  footerLinks: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#fff', marginHorizontal: 10 },
  icon: { width: 30, height: 30, marginHorizontal: 10 },
  copyright: { color: '#fff', textAlign: 'center' }
});
