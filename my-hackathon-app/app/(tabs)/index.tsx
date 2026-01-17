import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { DeviceMotion } from 'expo-sensors';

export default function SquatTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [motion, setMotion] = useState({
    acceleration: { x: 0, y: 0, z: 0 },
    rotation: { alpha: 0, beta: 0, gamma: 0 }
  });
  
  const [metrics, setMetrics] = useState({
    verticalDisplacement: 0,
    tiltAngle: 0,
    currentAcceleration: 0
  });

  useEffect(() => {
    let subscription: any;
    
    if (isTracking) {
      // Set update interval to 100ms (10 updates per second)
      DeviceMotion.setUpdateInterval(100);
      
      subscription = DeviceMotion.addListener((data) => {
        const { acceleration, rotation } = data;
        
        // Update raw motion data
        setMotion({
          acceleration: acceleration || { x: 0, y: 0, z: 0 },
          rotation: rotation || { alpha: 0, beta: 0, gamma: 0 }
        });
        
        // Calculate metrics
        if (acceleration && rotation) {
          // Vertical displacement (using Y-axis as vertical when phone is in pocket)
          const verticalAccel = acceleration.y;
          
          // Tilt angle (pitch - rotation around X-axis, converted to degrees)
          const tiltAngle = rotation.beta * (180 / Math.PI);
          
          // Overall acceleration magnitude
          const accelMagnitude = Math.sqrt(
            acceleration.x ** 2 + 
            acceleration.y ** 2 + 
            acceleration.z ** 2
          );
          
          setMetrics({
            verticalDisplacement: verticalAccel,
            tiltAngle: tiltAngle,
            currentAcceleration: accelMagnitude
          });
        }
      });
    }
    
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isTracking]);

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>🏋️ Squat Tracker</Text>
      <Text style={styles.subtitle}>Live Motion Metrics</Text>
      
      {/* Tracking Status */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, isTracking && styles.statusActive]} />
        <Text style={styles.statusText}>
          {isTracking ? 'TRACKING' : 'STOPPED'}
        </Text>
      </View>

      {/* Main Metrics */}
      <View style={styles.metricsContainer}>
        
        {/* Vertical Displacement */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Vertical Displacement</Text>
          <Text style={styles.metricValue}>
            {metrics.verticalDisplacement.toFixed(3)}
          </Text>
          <Text style={styles.metricUnit}>m/s²</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(Math.abs(metrics.verticalDisplacement) * 10, 100)}%`,
                  backgroundColor: metrics.verticalDisplacement < 0 ? '#4CAF50' : '#FF6B6B'
                }
              ]} 
            />
          </View>
          <Text style={styles.hint}>
            {metrics.verticalDisplacement < -0.5 ? '⬇️ Going down' : 
             metrics.verticalDisplacement > 0.5 ? '⬆️ Going up' : '➖ Stable'}
          </Text>
        </View>

        {/* Tilt Angle */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Tilt/Pitch Angle</Text>
          <Text style={styles.metricValue}>
            {metrics.tiltAngle.toFixed(1)}°
          </Text>
          <Text style={styles.metricUnit}>degrees</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(Math.abs(metrics.tiltAngle) / 90 * 100, 100)}%`,
                  backgroundColor: '#FFA726'
                }
              ]} 
            />
          </View>
          <Text style={styles.hint}>
            {Math.abs(metrics.tiltAngle) > 20 ? '📐 Tilted' : '📱 Upright'}
          </Text>
        </View>

        {/* Acceleration Magnitude */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Acceleration Magnitude</Text>
          <Text style={styles.metricValue}>
            {metrics.currentAcceleration.toFixed(3)}
          </Text>
          <Text style={styles.metricUnit}>m/s²</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(metrics.currentAcceleration * 5, 100)}%`,
                  backgroundColor: '#42A5F5'
                }
              ]} 
            />
          </View>
          <Text style={styles.hint}>
            {metrics.currentAcceleration > 1.5 ? '⚡ High movement' : '🔵 Low movement'}
          </Text>
        </View>
      </View>

      {/* Raw Data (collapsed view) */}
      <View style={styles.rawDataContainer}>
        <Text style={styles.rawDataTitle}>Raw Sensor Data</Text>
        <View style={styles.rawDataRow}>
          <Text style={styles.rawDataLabel}>Accel X:</Text>
          <Text style={styles.rawDataValue}>{motion.acceleration.x.toFixed(3)}</Text>
        </View>
        <View style={styles.rawDataRow}>
          <Text style={styles.rawDataLabel}>Accel Y:</Text>
          <Text style={styles.rawDataValue}>{motion.acceleration.y.toFixed(3)}</Text>
        </View>
        <View style={styles.rawDataRow}>
          <Text style={styles.rawDataLabel}>Accel Z:</Text>
          <Text style={styles.rawDataValue}>{motion.acceleration.z.toFixed(3)}</Text>
        </View>
      </View>

      {/* Control Button */}
      <TouchableOpacity 
        style={[styles.button, isTracking && styles.buttonStop]}
        onPress={toggleTracking}
      >
        <Text style={styles.buttonText}>
          {isTracking ? 'STOP TRACKING' : 'START TRACKING'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.instructions}>
        💡 Put phone in front pocket and do squats
      </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#666',
    marginRight: 8,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  metricsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  metricLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  metricUnit: {
    color: '#666',
    fontSize: 16,
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  hint: {
    color: '#aaa',
    fontSize: 14,
    fontStyle: 'italic',
  },
  rawDataContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  rawDataTitle: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  rawDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rawDataLabel: {
    color: '#666',
    fontSize: 14,
  },
  rawDataValue: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonStop: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  instructions: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});