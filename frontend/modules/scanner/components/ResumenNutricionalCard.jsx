import React, { useEffect, useState, memo } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatMinerales } from '../../../utils/formatUtils';

// Definir los límites de minerales actualizados para comidas individuales
const THRESHOLDS = {
  SODIO: 570,    // Límite máximo por comida
  POTASIO: 700,  // Límite máximo por comida
  FOSFORO: 330   // Límite máximo por comida
};

// Definir los límites de advertencia como aproximadamente 2/3 del valor máximo
const WARNING_THRESHOLDS = {
  SODIO: 380,    // Advertencia para comida individual
  POTASIO: 470,  // Advertencia para comida individual
  FOSFORO: 220   // Advertencia para comida individual
};

//Crear el componente ResumenNutricionalCard
const ResumenNutricionalCard = (props) => {


  if (!props) props = {};
  

  const totales = props.totales || {};
  
  const safeCompatibilidad = {
    sodio: { compatible: false, valor: 0 },
    potasio: { compatible: false, valor: 0 },
    fosforo: { compatible: false, valor: 0 }
  };
  
  if (props.compatibilidad) {
    if (props.compatibilidad.sodio) {
      safeCompatibilidad.sodio.compatible = !!props.compatibilidad.sodio.compatible;
      safeCompatibilidad.sodio.valor = Number(props.compatibilidad.sodio.valor || 0);
    }
    
    if (props.compatibilidad.potasio) {
      safeCompatibilidad.potasio.compatible = !!props.compatibilidad.potasio.compatible;
      safeCompatibilidad.potasio.valor = Number(props.compatibilidad.potasio.valor || 0);
    }
    
    if (props.compatibilidad.fosforo) {
      safeCompatibilidad.fosforo.compatible = !!props.compatibilidad.fosforo.compatible;
      safeCompatibilidad.fosforo.valor = Number(props.compatibilidad.fosforo.valor || 0);
    }
  }
  
  const safeValues = {
    sodio: safeCompatibilidad.sodio.valor,
    potasio: safeCompatibilidad.potasio.valor,
    fosforo: safeCompatibilidad.fosforo.valor
  };
  
  const [prevValues, setPrevValues] = useState(safeValues);
  
  const animatedValue = new Animated.Value(0);
  
  useEffect(() => {

    const hasChanged = 
      safeValues.sodio !== prevValues.sodio || 
      safeValues.potasio !== prevValues.potasio || 
      safeValues.fosforo !== prevValues.fosforo;
    
    if (hasChanged) {

      setPrevValues(safeValues);
      

      if (Platform.OS !== 'web') {
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 300,
            delay: 800,
            useNativeDriver: false
          })
        ]).start();
      }
    }
  }, [
    safeValues.sodio,
    safeValues.potasio, 
    safeValues.fosforo,
    props.totales?.sodio,
    props.totales?.potasio,
    props.totales?.fosforo
  ]);
  
  // Animation interpolation
  const highlightBackground = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0)', 'rgba(106, 11, 34, 0.1)']
  });
  

  const sodioFormatted = formatMinerales(safeValues.sodio);
  const potasioFormatted = formatMinerales(safeValues.potasio);
  const fosforoFormatted = formatMinerales(safeValues.fosforo);
  

  // Determinar el estado de cada mineral
  const getMineralStatus = (mineral, value) => {
    if (mineral === 'sodio') {
      if (value < WARNING_THRESHOLDS.SODIO) return 0; // Good - Green
      if (value < THRESHOLDS.SODIO) return 1;         // Warning - Yellow
      return 2;                                       // Exceeded - Red
    }
    else if (mineral === 'potasio') {
      if (value < WARNING_THRESHOLDS.POTASIO) return 0;
      if (value < THRESHOLDS.POTASIO) return 1;
      return 2;
    }
    else if (mineral === 'fosforo') {
      if (value < WARNING_THRESHOLDS.FOSFORO) return 0;
      if (value < THRESHOLDS.FOSFORO) return 1;
      return 2;
    }
    return 0;
  };
  
  // Get color for mineral status
  const getMineralColor = (status) => {
    switch(status) {
      case 0: return '#4CAF50'; // Green
      case 1: return '#FFC107'; // Yellow
      case 2: return '#F44336'; // Red
      default: return '#4CAF50';
    }
  };
  
  // Determine data source type
  const esEstimacionIA = props.fuenteValores === 'estimacion_ia';
  
  // Calculate status for each mineral
  const sodioStatus = getMineralStatus('sodio', safeValues.sodio);
  const potasioStatus = getMineralStatus('potasio', safeValues.potasio);
  const fosforoStatus = getMineralStatus('fosforo', safeValues.fosforo);
  
  // Función para calcular el porcentaje del límite
  const calcularPorcentajeLimite = (valor, limite) => {
    const porcentaje = Math.min(100, Math.round((valor / limite) * 100));
    return porcentaje;
  };

  // Calcular porcentajes para mostrar
  const sodioPorcentaje = calcularPorcentajeLimite(safeValues.sodio, THRESHOLDS.SODIO);
  const potasioPorcentaje = calcularPorcentajeLimite(safeValues.potasio, THRESHOLDS.POTASIO);
  const fosforoPorcentaje = calcularPorcentajeLimite(safeValues.fosforo, THRESHOLDS.FOSFORO);
  
  return (
    <Animated.View style={[
      styles.card, 
      { backgroundColor: highlightBackground }
    ]}>
      <View style={styles.headerContainer}>
        <Text style={styles.cardTitle}>Minerales relevantes en enfermedad renal</Text>
      </View>
      
      
      <View style={styles.sourceContainer}>
        <View style={[
          styles.sourceBadge,
          esEstimacionIA ? styles.iaBadge : styles.realBadge
        ]}>
          <MaterialIcons 
            name={esEstimacionIA ? "psychology" : "verified"} 
            size={14} 
            color={esEstimacionIA ? "#FF6D00" : "#388E3C"} 
          />
          <Text style={[
            styles.sourceText,
            esEstimacionIA ? styles.iaText : styles.realText
          ]}>
            {esEstimacionIA ? "Inteligencia Artificial" : "Base de datos"}
          </Text>
        </View>
      </View>
      
      {/* Semáforo de minerales - ACTUALIZADO con nuevos límites y visualización */}
      <View style={styles.mineralSection}>
        <View style={styles.mineralItem}>
          <View style={styles.mineralLabelContainer}>
            <Text style={styles.mineralLabel}>Sodio</Text>
            <Text style={styles.mineralLimit}>Límite: {THRESHOLDS.SODIO}mg</Text>
          </View>
          <View style={styles.mineralBarContainer}>
            {/* Marcador del umbral de advertencia */}
            <View style={[
              styles.warningThresholdMarker, 
              { left: `${(WARNING_THRESHOLDS.SODIO / THRESHOLDS.SODIO) * 100}%` }
            ]} />
            
            {/* Barra principal - ajustada para llegar a 100% en el límite exacto */}
            <View 
              style={[
                styles.mineralBarBackground,
                sodioStatus > 0 && styles.mineralBarBackgroundWarning
              ]} 
            >
              <View 
                style={[
                  styles.mineralBar, 
                  { 
                    backgroundColor: getMineralColor(sodioStatus),
                    width: `${Math.min(100, Math.max(5, safeValues.sodio / THRESHOLDS.SODIO * 100))}%`
                  }
                ]} 
              />
            </View>
            
            {/* Porcentaje consumido del límite */}
            <Text style={[
              styles.percentageLabel,
              sodioStatus === 2 ? styles.percentageLabelDanger : 
              sodioStatus === 1 ? styles.percentageLabelWarning : {}
            ]}>
              {sodioPorcentaje}%
            </Text>
          </View>
          <Text style={[
            styles.mineralValue,
            sodioStatus === 2 ? styles.mineralValueExceeded : 
            sodioStatus === 1 ? styles.mineralValueWarning : {}
          ]}>
            {sodioFormatted}
          </Text>
        </View>
        
        <View style={styles.mineralItem}>
          <View style={styles.mineralLabelContainer}>
            <Text style={styles.mineralLabel}>Potasio</Text>
            <Text style={styles.mineralLimit}>Límite: {THRESHOLDS.POTASIO}mg</Text>
          </View>
          <View style={styles.mineralBarContainer}>
            {/* Marcador del umbral de advertencia */}
            <View style={[
              styles.warningThresholdMarker, 
              { left: `${(WARNING_THRESHOLDS.POTASIO / THRESHOLDS.POTASIO) * 100}%` }
            ]} />
            
            {/* Barra principal - ajustada para llegar a 100% en el límite exacto */}
            <View 
              style={[
                styles.mineralBarBackground,
                potasioStatus > 0 && styles.mineralBarBackgroundWarning
              ]} 
            >
              <View 
                style={[
                  styles.mineralBar, 
                  { 
                    backgroundColor: getMineralColor(potasioStatus),
                    width: `${Math.min(100, Math.max(5, safeValues.potasio / THRESHOLDS.POTASIO * 100))}%`
                  }
                ]} 
              />
            </View>
            
            {/* Porcentaje consumido del límite */}
            <Text style={[
              styles.percentageLabel,
              potasioStatus === 2 ? styles.percentageLabelDanger : 
              potasioStatus === 1 ? styles.percentageLabelWarning : {}
            ]}>
              {potasioPorcentaje}%
            </Text>
          </View>
          <Text style={[
            styles.mineralValue,
            potasioStatus === 2 ? styles.mineralValueExceeded : 
            potasioStatus === 1 ? styles.mineralValueWarning : {}
          ]}>
            {potasioFormatted}
          </Text>
        </View>
        
        <View style={styles.mineralItem}>
          <View style={styles.mineralLabelContainer}>
            <Text style={styles.mineralLabel}>Fósforo</Text>
            <Text style={styles.mineralLimit}>Límite: {THRESHOLDS.FOSFORO}mg</Text>
          </View>
          <View style={styles.mineralBarContainer}>
            {/* Marcador del umbral de advertencia */}
            <View style={[
              styles.warningThresholdMarker, 
              { left: `${(WARNING_THRESHOLDS.FOSFORO / THRESHOLDS.FOSFORO) * 100}%` }
            ]} />
            
            {/* Barra principal - ajustada para llegar a 100% en el límite exacto */}
            <View 
              style={[
                styles.mineralBarBackground,
                fosforoStatus > 0 && styles.mineralBarBackgroundWarning
              ]} 
            >
              <View 
                style={[
                  styles.mineralBar, 
                  { 
                    backgroundColor: getMineralColor(fosforoStatus),
                    width: `${Math.min(100, Math.max(5, safeValues.fosforo / THRESHOLDS.FOSFORO * 100))}%`
                  }
                ]} 
              />
            </View>
            
            {/* Porcentaje consumido del límite */}
            <Text style={[
              styles.percentageLabel,
              fosforoStatus === 2 ? styles.percentageLabelDanger : 
              fosforoStatus === 1 ? styles.percentageLabelWarning : {}
            ]}>
              {fosforoPorcentaje}%
            </Text>
          </View>
          <Text style={[
            styles.mineralValue,
            fosforoStatus === 2 ? styles.mineralValueExceeded : 
            fosforoStatus === 1 ? styles.mineralValueWarning : {}
          ]}>
            {fosforoFormatted}
          </Text>
        </View>
      </View>
      
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: '#4CAF50'}]}></View>
          <Text style={styles.legendText}>Dentro del límite recomendado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: '#FFC107'}]}></View>
          <Text style={styles.legendText}>Precaución, acercándose al límite</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, {backgroundColor: '#F44336'}]}></View>
          <Text style={styles.legendText}>Excede el límite recomendado</Text>
        </View>
        
        
        {esEstimacionIA && (
          <Text style={styles.estimadoNota}>
            Los valores mostrados son estimaciones de IA basadas en el análisis de imagen y 
            podrían variar respecto a los valores reales de la base de datos.
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, 
    shadowRadius: 3,
    borderWidth: 0, 
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    textAlign: 'center', 
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceContainer: {
    alignItems: 'center', 
    marginBottom: 16,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  iaBadge: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFCC80',
  },
  realBadge: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  sourceText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  iaText: {
    color: '#FF6D00',
  },
  realText: {
    color: '#388E3C',
  },
  
  mineralValueWarning: {
    color: '#FFA000',
    fontWeight: '600',
  },
  
  estimadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  estimadoText: {
    fontSize: 12,
    color: '#E65100',
  },
  mineralSection: {
    marginTop: 8,
  },
  mineralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  mineralLabelContainer: {
    width: 70,
  },
  mineralLabel: {
    fontSize: 14,
    color: '#333',
  },
  mineralLimit: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  mineralBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#EEEEEE',
    borderRadius: 6,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  mineralBarBackground: {
    flex: 1,
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 7,
    overflow: 'hidden',
    position: 'relative',
  },
  mineralBarBackgroundWarning: {
    backgroundColor: '#FFECB3', // Fondo amarillo claro cuando está en advertencia o excedido
  },
  mineralBar: {
    height: '100%',
    borderRadius: 7,
  },
  warningThresholdMarker: {
    position: 'absolute',
    height: 14,
    width: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 2,
  },
  percentageLabel: {
    position: 'absolute',
    right: 5,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    zIndex: 3,
  },
  percentageLabelWarning: {
    color: '#F57F17',
  },
  percentageLabelDanger: {
    color: '#FFFFFF',
  },
  mineralValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 60,
    textAlign: 'right',
  },
  mineralValueExceeded: {
    color: '#F44336',
    fontWeight: '700',
  },
  legendContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  estimadoNota: {
    fontSize: 12,
    color: '#F57C00',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#FFB74D',
    paddingLeft: 8,
    backgroundColor: '#FFF8E1',
    paddingVertical: 8,
    borderRadius: 4,
  }
});

export default memo(ResumenNutricionalCard, (prevProps, nextProps) => {
  if (!prevProps || !nextProps) return false;
  
  const prevCompatibilidad = prevProps.compatibilidad || {};
  const nextCompatibilidad = nextProps.compatibilidad || {};
  
  // Check if the source of data changed
  if (prevProps.fuenteValores !== nextProps.fuenteValores) {
    return false;
  }
  
  // Check if any of the mineral values changed
  const mineralsEqual = 
    prevCompatibilidad.sodio?.valor === nextCompatibilidad.sodio?.valor &&
    prevCompatibilidad.potasio?.valor === nextCompatibilidad.potasio?.valor &&
    prevCompatibilidad.fosforo?.valor === nextCompatibilidad.fosforo?.valor;
  
  return mineralsEqual;
});
