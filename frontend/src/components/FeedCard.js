import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../constants/colors';

const FeedCard = ({ title, description, type, buttonText, onPress, isDone }) => {
  // Get icon and color based on type
  const getTypeInfo = () => {
    switch (type) {
      case 'Homework':
        return { icon: 'book-open', color: colors.primary };
      case 'Material':
        return { icon: 'file-text', color: colors.cardIndigo };
      case 'Notice':
      default:
        return { icon: 'bell', color: colors.secondary };
    }
  };

  const typeInfo = getTypeInfo();

  return (
    <View style={styles.card}>
      
      {/* Header with Type Badge */}
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '15' }]}>
          <Feather name={typeInfo.icon} size={14} color={typeInfo.color} />
          <Text style={[styles.typeText, { color: typeInfo.color }]}>{type}</Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {description}
      </Text>
      
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, isDone && styles.buttonDone]} 
          onPress={onPress}
          disabled={isDone}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isDone ? "Completed ✓" : buttonText || "Submit"}
          </Text>
        </TouchableOpacity>

        {/* Comment/Chat Icon */}
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="message-circle" size={20} color={colors.text.secondary} />
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
    marginBottom: 16,
    ...colors.cardShadow,
  },
  header: {
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
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
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
    alignItems: 'center',
  },
  buttonDone: {
    backgroundColor: colors.success,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FeedCard;