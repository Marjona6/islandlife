export const getContainerStyle = () => {
  const baseStyle = {
    marginTop: -20,
    overflow: 'hidden' as const,
    paddingTop: 20,
    borderRadius: 20,
    padding: 12,
    width: 360,
    alignSelf: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative' as const,
  };

  return {
    ...baseStyle,
    backgroundColor: 'transparent',
  };
};
