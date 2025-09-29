import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, size = 'medium', className = '' }) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const getAvatarSize = () => {
    switch (size) {
      case 'small':
        return { width: '24px', height: '24px', fontSize: '10px' };
      case 'large':
        return { width: '48px', height: '48px', fontSize: '18px' };
      default:
        return { width: '32px', height: '32px', fontSize: '14px' };
    }
  };

  const sizeStyles = getAvatarSize();

  return (
    <div
      className={`user-avatar ${className}`}
      style={{
        ...sizeStyles,
        borderRadius: '50%',
        background: 'var(--primary-purple)',
        color: 'var(--white)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        flexShrink: 0
      }}
    >
      {getInitials(name)}
    </div>
  );
};

export default UserAvatar;
