import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const RecomendacionesCard = ({ analisisTexto, resultadoCompleto }) => {
  // Agregar estado para manejar la expansión del texto
  const [expanded, setExpanded] = useState(false);
  
  // Find recommendations from all possible sources
  const getRecomendaciones = () => {
    // Mirar en todos los posibles lugares donde se pueden encontrar recomendaciones
    if (resultadoCompleto?.recomendaciones) {
      // First priority: top-level recomendaciones field
      return resultadoCompleto.recomendaciones;
    } else if (analisisTexto?.recomendaciones) {
      
      return analisisTexto.recomendaciones;
    } else if (typeof analisisTexto === 'string' && analisisTexto.includes('recomienda')) {
      return analisisTexto;
    }
    
   
    return null;
  };

  
  const isCompatible = () => {
    
    if (resultadoCompleto?.compatibilidad_renal !== undefined) {
      return resultadoCompleto.compatibilidad_renal;
    } else if (analisisTexto?.compatibilidad_renal !== undefined) {
      return analisisTexto.compatibilidad_renal;
    } else if (resultadoCompleto?.compatible_con_perfil !== undefined) {
      return resultadoCompleto.compatible_con_perfil;
    }
    return null; 
  };

  const recomendaciones = getRecomendaciones();
  const compatible = isCompatible();
  
  
  if (!recomendaciones) return null;
  
  
  const isLongText = recomendaciones.length > 100;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <MaterialIcons 
          name={compatible === false ? "warning" : "check-circle"} 
          size={24} 
          color={compatible === false ? "#F44336" : "#4CAF50"} 
        />
        <Text style={styles.cardTitle}>Recomendaciones</Text>
      </View>
      
      <View style={[
        styles.statusBadge,
        { backgroundColor: compatible === false ? "#FFEBEE" : "#E8F5E9" }
      ]}>
        <Text style={[
          styles.statusText,
          { color: compatible === false ? "#C62828" : "#2E7D32" }
        ]}>
          {compatible === false 
            ? "No recomendado para pacientes renales" 
            : "Recomendado para pacientes renales"}
        </Text>
      </View>
      
      <Text 
        style={styles.recomendacionText}
        numberOfLines={expanded || !isLongText ? null : 4}
      >
        {recomendaciones}
      </Text>
      
      {/* Agregar ver mas a los menus*/}
      {isLongText && (
        <TouchableOpacity 
          style={styles.expandButton}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.expandButtonText}>
            {expanded ? "Ver menos" : "Ver más"}
          </Text>
          <MaterialIcons 
            name={expanded ? "expand-less" : "expand-more"} 
            size={20} 
            color="#690B22" 
            style={styles.expandIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginLeft: 8,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recomendacionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  expandButtonText: {
    color: '#690B22',
    fontWeight: '500',
    fontSize: 14,
  },
  expandIcon: {
    marginLeft: 4,
  }
});

export default RecomendacionesCard;
