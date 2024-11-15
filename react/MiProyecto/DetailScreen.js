import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Platform, Dimensions } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Asset } from 'expo-asset';

function DetailScreen({ route, navigation }) {
  const { sheetId } = route.params;
  const [sheet, setSheet] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const apiUrl = 'http://ec2-18-204-207-102.compute-1.amazonaws.com:5000';

  useEffect(() => {
    fetch(`${apiUrl}/partituras/${sheetId}`)
      .then(response => {
        if (!response.ok) throw new Error('Partitura no encontrada');
        return response.json();
      })
      .then(data => setSheet(data))
      .catch(error => console.error(error));

    fetch(`${apiUrl}/recomendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_cancion: sheetId, num_recomendaciones: 5 })
    })
      .then(response => response.json())
      .then(data => setRecommendations(data))
      .catch(error => console.error(error));
  }, [sheetId]);

  const downloadImage = async () => {
    const asset = Asset.fromModule(require('./assets/partitura.jpg'));
    await asset.downloadAsync();
  
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = asset.uri;
      link.download = 'partitura.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('Imagen descargada');
    } else {
      try {
        const savedAsset = await MediaLibrary.createAssetAsync(asset.localUri || asset.uri);
        Alert.alert('Imagen descargada en la galería');
      } catch (error) {
        console.error(error);
        Alert.alert('Hubo un error al descargar la imagen');
      }
    }
  };

  if (!sheet) {
    return <Text style={styles.loadingText}>Cargando...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('./assets/logo.jpg')} style={styles.logo} />
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

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{sheet.nombre}</Text>

        {/* Container for details and image preview */}
        <View style={styles.detailsContainer}>
          <View style={styles.details}>
            <Text style={styles.detailsText}>Autor: {sheet.autor}</Text>
            <Text style={styles.detailsText}>Género: {sheet.género}</Text>
            <Text style={styles.detailsText}>Tempo: {sheet.tempo}</Text>
            <Text style={styles.detailsText}>Claves: {sheet.claves}</Text>
            <Text style={styles.detailsText}>Notas: {sheet.notas}</Text>
          </View>
          <TouchableOpacity onPress={downloadImage}>
            <Image source={require('./assets/partitura.jpg')} style={styles.previewImage} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Te podría interesar...</Text>

        {/* ScrollView for recommendations */}
        <ScrollView style={styles.recommendationsContainer}>
          {recommendations.map(recommendedSheet => (
            <TouchableOpacity
              key={recommendedSheet.id}
              style={styles.recommendationItem}
              onPress={() => navigation.push('Detalles', { sheetId: recommendedSheet.id })}
            >
              <Text style={styles.recommendationTitle}>{recommendedSheet.nombre}</Text>
              <Text style={styles.recommendationText}>Autor: {recommendedSheet.autor}</Text>
              <Text style={styles.recommendationText}>Género: {recommendedSheet.género}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </ScrollView>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: '#000', padding: 10 },
  logo: { width: 80, height: 80 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', width: '50%' },
  navItem: { color: '#fff', fontSize: 18, marginHorizontal: 10 },
  loginButton: { backgroundColor: '#f48024', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  loginText: { color: '#fff', fontWeight: 'bold' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#fff' },
  detailsContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  details: { flex: 1 },
  detailsText: { fontSize: 18, marginVertical: 5, color: '#fff' },
  previewImage: { width: 120, height: 160, marginLeft: 20, borderRadius: 10 },
  subtitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 15, color: '#fff' },
  recommendationsContainer: { maxHeight: 300 }, 
  recommendationItem: { padding: 15, backgroundColor: '#333', marginBottom: 10 },
  recommendationTitle: { fontSize: 18, color: '#fff' },
  recommendationText: { fontSize: 16, color: '#fff' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#000', paddingVertical: 20, paddingHorizontal: 10, alignItems: 'center' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: Dimensions.get('window').width * 0.9, marginBottom: 10 },
  footerIcons: { flexDirection: 'row', justifyContent: 'flex-start' },
  footerLinks: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#fff', marginHorizontal: 10 },
  icon: { width: 30, height: 30, marginHorizontal: 10 },
  copyright: { color: '#fff', textAlign: 'center' },
  loadingText: { color: '#fff', textAlign: 'center', marginTop: 20, fontSize: 20 }
});

export default DetailScreen;
