import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../constants/colors';

const FeedCard = ({ title, description, buttonText, onPress, isDone }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, isDone && styles.buttonDone]} 
          onPress={onPress}
          disabled={isDone}
        >
          <Text style={styles.buttonText}>
            {isDone ? "Completed" : buttonText || "Mark as Done"}
          </Text>
        </TouchableOpacity>

        {/* Chat Bubble Icon Placeholder */}
        <TouchableOpacity>
          <Text style={{ fontSize: 20, opacity: 0.5 }}>💬</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...colors.shadow, // Soft shadow
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#000000', // Black button as per design
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonDone: {
    backgroundColor: colors.success, // Green when done
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  }
});

export default FeedCard;