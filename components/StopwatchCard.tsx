import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Vibration,
} from 'react-native';
import { StopwatchState, Lap } from '../hooks/useStopwatch';
import { formatTime, formatLapDiff } from '../utils/time';

type Props = {
  state: StopwatchState;
  isActive: boolean;
  onToggle: () => void;
  onLap: () => void;
  onReset: () => void;
  onDelete: () => void;
  onSelect: () => void;
  onRename: (name: string) => void;
};

export default function StopwatchCard({
  state,
  isActive,
  onToggle,
  onLap,
  onReset,
  onDelete,
  onSelect,
  onRename,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [labelInput, setLabelInput] = useState(state.label);
  const bestLap = state.laps.length > 0
    ? Math.min(...state.laps.map(l => l.diff))
    : null;
  const worstLap = state.laps.length > 1
    ? Math.max(...state.laps.map(l => l.diff))
    : null;

  function handleLap() {
    Vibration.vibrate(40);
    onLap();
  }

  function handleToggle() {
    Vibration.vibrate(60);
    onToggle();
  }

  function getLapStyle(lap: Lap) {
    if (state.laps.length < 2) return styles.lapNeutral;
    if (lap.diff === bestLap) return styles.lapBest;
    if (lap.diff === worstLap) return styles.lapWorst;
    return styles.lapNeutral;
  }

  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.cardActive]}
      onPress={onSelect}
      activeOpacity={0.85}
    >
      {/* Header */}
      <View style={styles.header}>
        {editing ? (
          <TextInput
            style={styles.labelInput}
            value={labelInput}
            onChangeText={setLabelInput}
            onBlur={() => {
              onRename(labelInput.trim() || state.label);
              setEditing(false);
            }}
            autoFocus
            maxLength={20}
          />
        ) : (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {state.label}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Time display */}
      <Text style={[styles.time, isActive && styles.timeActive]}>
        {formatTime(state.elapsed)}
      </Text>

      {/* Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.btn, styles.btnLap]}
          onPress={handleLap}
          disabled={!state.running && state.elapsed === 0}
        >
          <Text style={styles.btnText}>
            {!state.running && state.elapsed > 0 ? 'Reset' : 'Vuelta'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, state.running ? styles.btnStop : styles.btnStart]}
          onPress={handleToggle}
        >
          <Text style={styles.btnText}>
            {state.running ? 'Parar' : state.elapsed > 0 ? 'Reanudar' : 'Iniciar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnReset]}
          onPress={onReset}
          disabled={state.elapsed === 0}
        >
          <Text style={styles.btnText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Laps */}
      {state.laps.length > 0 && (
        <ScrollView style={styles.lapList} nestedScrollEnabled>
          <View style={styles.lapHeader}>
            <Text style={styles.lapHeaderText}>Vuelta</Text>
            <Text style={styles.lapHeaderText}>Tiempo</Text>
            <Text style={styles.lapHeaderText}>Diff</Text>
          </View>
          {state.laps.map(lap => (
            <View key={lap.id} style={[styles.lapRow, getLapStyle(lap)]}>
              <Text style={styles.lapNum}>#{lap.id}</Text>
              <Text style={styles.lapTime}>{formatTime(lap.time)}</Text>
              <Text style={styles.lapDiff}>{formatLapDiff(lap.diff)}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {isActive && (
        <View style={styles.activeIndicator}>
          <Text style={styles.activeText}>● VOL=Vuelta</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const CARD_BG = '#12121e';
const CARD_ACTIVE_BG = '#181830';
const GREEN = '#00e676';
const RED = '#ff5252';
const AMBER = '#ffd740';
const GRAY = '#444466';

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a40',
  },
  cardActive: {
    backgroundColor: CARD_ACTIVE_BG,
    borderColor: GREEN,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8888aa',
    letterSpacing: 1,
  },
  labelActive: {
    color: GREEN,
  },
  labelInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: GREEN,
    minWidth: 100,
    padding: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    color: '#555577',
    fontSize: 16,
  },
  time: {
    fontSize: 52,
    fontVariant: ['tabular-nums'],
    fontWeight: '200',
    color: '#ccccee',
    letterSpacing: 2,
    textAlign: 'center',
    marginVertical: 8,
  },
  timeActive: {
    color: '#ffffff',
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnStart: {
    backgroundColor: GREEN,
  },
  btnStop: {
    backgroundColor: RED,
  },
  btnLap: {
    backgroundColor: GRAY,
  },
  btnReset: {
    backgroundColor: '#222233',
    borderWidth: 1,
    borderColor: '#333355',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  lapList: {
    maxHeight: 160,
    marginTop: 12,
  },
  lapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a40',
    marginBottom: 2,
  },
  lapHeaderText: {
    color: '#555577',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  lapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 6,
    marginBottom: 2,
  },
  lapNeutral: {
    backgroundColor: 'transparent',
  },
  lapBest: {
    backgroundColor: 'rgba(0,230,118,0.1)',
  },
  lapWorst: {
    backgroundColor: 'rgba(255,82,82,0.1)',
  },
  lapNum: {
    flex: 1,
    color: '#555577',
    fontSize: 13,
    textAlign: 'center',
  },
  lapTime: {
    flex: 1,
    color: '#ccccee',
    fontSize: 13,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  lapDiff: {
    flex: 1,
    color: '#8888aa',
    fontSize: 13,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  activeIndicator: {
    marginTop: 8,
    alignItems: 'center',
  },
  activeText: {
    color: GREEN,
    fontSize: 11,
    opacity: 0.8,
  },
});
