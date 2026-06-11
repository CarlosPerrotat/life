import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Vibration,
} from 'react-native';
import StopwatchCard from './components/StopwatchCard';
import { useStopwatch } from './hooks/useStopwatch';
import { useVolumeButton } from './hooks/useVolumeButton';

type StopwatchEntry = {
  id: string;
  label: string;
};

let nextId = 1;

function makeId() {
  return `sw-${nextId++}`;
}

// Individual stopwatch wrapper so each has its own hook instance
function StopwatchWrapper({
  entry,
  isActive,
  onDelete,
  onSelect,
  externalLap,
  externalToggle,
}: {
  entry: StopwatchEntry;
  isActive: boolean;
  onDelete: () => void;
  onSelect: () => void;
  externalLap?: boolean;
  externalToggle?: boolean;
}) {
  const { state, toggle, lap, reset, rename } = useStopwatch(entry.id, entry.label);

  const prevLapRef = useRef(externalLap);
  if (prevLapRef.current !== externalLap && isActive) {
    prevLapRef.current = externalLap;
    lap();
  } else if (prevLapRef.current !== externalLap) {
    prevLapRef.current = externalLap;
  }

  const prevToggleRef = useRef(externalToggle);
  if (prevToggleRef.current !== externalToggle && isActive) {
    prevToggleRef.current = externalToggle;
    toggle();
  } else if (prevToggleRef.current !== externalToggle) {
    prevToggleRef.current = externalToggle;
  }

  return (
    <StopwatchCard
      state={state}
      isActive={isActive}
      onToggle={toggle}
      onLap={lap}
      onReset={reset}
      onDelete={onDelete}
      onSelect={onSelect}
      onRename={rename}
    />
  );
}

export default function App() {
  const [entries, setEntries] = useState<StopwatchEntry[]>([
    { id: makeId(), label: 'Corredor 1' },
  ]);
  const [activeId, setActiveId] = useState<string>(entries[0].id);
  const [lapTick, setLapTick] = useState(false);
  const [toggleTick, setToggleTick] = useState(false);

  const addStopwatch = useCallback(() => {
    if (entries.length >= 8) {
      Alert.alert('Límite alcanzado', 'Máximo 8 cronómetros.');
      return;
    }
    const id = makeId();
    const label = `Corredor ${entries.length + 1}`;
    setEntries(prev => [...prev, { id, label }]);
    setActiveId(id);
    Vibration.vibrate(30);
  }, [entries.length]);

  const deleteStopwatch = useCallback((id: string) => {
    setEntries(prev => {
      if (prev.length === 1) return prev;
      const next = prev.filter(e => e.id !== id);
      if (id === activeId) setActiveId(next[next.length - 1].id);
      return next;
    });
  }, [activeId]);

  // Volume UP → toggle active stopwatch, Volume DOWN → lap on active stopwatch
  useVolumeButton((type) => {
    if (type === 'up') {
      Vibration.vibrate(60);
      setToggleTick(t => !t);
    } else {
      Vibration.vibrate(40);
      setLapTick(t => !t);
    }
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>MulticronoTrack</Text>
          <Text style={styles.subtitle}>VOL+ = Iniciar/Parar  ·  VOL- = Vuelta</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={addStopwatch}>
          <Text style={styles.addBtnText}>+ Añadir</Text>
        </TouchableOpacity>
      </View>

      {/* Stopwatches */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {entries.map(entry => (
          <StopwatchWrapper
            key={entry.id}
            entry={entry}
            isActive={entry.id === activeId}
            onDelete={() => deleteStopwatch(entry.id)}
            onSelect={() => setActiveId(entry.id)}
            externalLap={lapTick}
            externalToggle={toggleTick}
          />
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Toca un cronómetro para seleccionarlo como activo
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: '#444466',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2a2a40',
  },
  addBtnText: {
    color: '#00e676',
    fontWeight: '700',
    fontSize: 14,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    color: '#333355',
    fontSize: 12,
  },
});
