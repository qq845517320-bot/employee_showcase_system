import React from 'react';

interface CompanyPhotoCardProps {
  photoUrl: string;
  alt?: string;
  isLoading?: boolean;
}

/**
 * 公司风采展示卡片 - 独立组件
 * 专门用于展示公司风采图片，与员工详情卡片完全独立
 * 采用简洁的长方形设计，只显示图片
 */
export const CompanyPhotoCard: React.FC<CompanyPhotoCardProps> = ({
  photoUrl,
  alt = '公司风采照片',
  isLoading = false,
}) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (e: any) => {
    console.error('[CompanyPhotoCard] Image load failed:', {
      photoUrl,
      error: e,
      errorMessage: e?.message || 'Unknown error'
    });
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div className="company-photo-card">
      {/* 照片容器 - 长方形设计 */}
      <div className="photo-container">
        {isLoading || !imageLoaded ? (
          <div className="loading-placeholder">
            <div className="spinner" />
          </div>
        ) : null}

        {imageError ? (
          <div className="error-placeholder">
            <div className="error-icon">⚠</div>
            <p>图片加载失败</p>
          </div>
        ) : (
          <img
            src={photoUrl}
            alt={alt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`photo-image ${imageLoaded ? 'loaded' : ''}`}
          />
        )}
      </div>

      <style>{`
        .company-photo-card {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .photo-container {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .photo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }

        .photo-image.loaded {
          opacity: 1;
        }

        .loading-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          position: absolute;
          top: 0;
          left: 0;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(255, 0, 0, 0.1) 0%, rgba(255, 0, 0, 0.05) 100%);
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          gap: 8px;
        }

        .error-icon {
          font-size: 32px;
          color: rgba(255, 100, 100, 0.8);
        }

        .error-placeholder p {
          margin: 0;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default CompanyPhotoCard;
