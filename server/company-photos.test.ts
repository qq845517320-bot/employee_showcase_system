import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createCompanyPhoto, getCompanyPhotos, deleteCompanyPhoto } from './db';

describe('Company Photos with Title and Subtitle', () => {
  const testCompanyId = 1;
  let createdPhotoIds: number[] = [];

  afterAll(async () => {
    // 清理所有测试数据
    for (const photoId of createdPhotoIds) {
      try {
        await deleteCompanyPhoto(photoId);
      } catch (error) {
        console.error(`Failed to clean up test photo ${photoId}:`, error);
      }
    }
  });

  it('should create a company photo with title and subtitle', async () => {
    const title = '港口风采展示';
    const subtitle = '深国际靖江港';
    const photoUrl = 'https://example.com/photo.jpg';
    const description = '测试照片';

    const result = await createCompanyPhoto(
      testCompanyId,
      photoUrl,
      title,
      subtitle,
      description
    );

    expect(result).toBeDefined();
    expect(result.insertId).toBeGreaterThan(0);
    createdPhotoIds.push(result.insertId);
  });

  it('should create a company photo with title only (no subtitle)', async () => {
    const title = '港口风采展示';
    const photoUrl = 'https://example.com/photo2.jpg';
    const description = '测试照片2';

    const result = await createCompanyPhoto(
      testCompanyId,
      photoUrl,
      title,
      undefined,
      description
    );

    expect(result).toBeDefined();
    expect(result.insertId).toBeGreaterThan(0);
    createdPhotoIds.push(result.insertId);
  });

  it('should retrieve company photos with title and subtitle', async () => {
    const title = '港口风采展示';
    const subtitle = '深国际靖江港';
    const photoUrl = 'https://example.com/photo3.jpg';

    const createResult = await createCompanyPhoto(
      testCompanyId,
      photoUrl,
      title,
      subtitle
    );

    expect(createResult.insertId).toBeGreaterThan(0);
    createdPhotoIds.push(createResult.insertId);

    // 等待一下以确保数据库已经保存
    await new Promise(resolve => setTimeout(resolve, 100));

    const photos = await getCompanyPhotos(testCompanyId);
    
    expect(photos).toBeDefined();
    expect(Array.isArray(photos)).toBe(true);
    expect(photos.length).toBeGreaterThan(0);
    
    const foundPhoto = photos.find(p => p.id === createResult.insertId);
    expect(foundPhoto).toBeDefined();
    if (foundPhoto) {
      expect(foundPhoto.title).toBe(title);
      expect(foundPhoto.subtitle).toBe(subtitle);
      expect(foundPhoto.photoUrl).toBe(photoUrl);
    }
  });

  it('should handle photos with empty subtitle', async () => {
    const title = '港口风采展示';
    const photoUrl = 'https://example.com/photo4.jpg';

    const createResult = await createCompanyPhoto(
      testCompanyId,
      photoUrl,
      title,
      ''
    );

    expect(createResult.insertId).toBeGreaterThan(0);
    createdPhotoIds.push(createResult.insertId);

    // 等待一下以确保数据库已经保存
    await new Promise(resolve => setTimeout(resolve, 100));

    const photos = await getCompanyPhotos(testCompanyId);
    const foundPhoto = photos.find(p => p.id === createResult.insertId);
    
    expect(foundPhoto).toBeDefined();
    if (foundPhoto) {
      expect(foundPhoto.title).toBe(title);
      // 空字符串应该被存储为 NULL
      expect(foundPhoto.subtitle).toBeNull();
    }
  });

  it('should delete a company photo and verify it no longer exists', async () => {
    const title = '待删除照片';
    const photoUrl = 'https://example.com/photo-to-delete.jpg';

    // 创建一张照片
    const createResult = await createCompanyPhoto(
      testCompanyId,
      photoUrl,
      title
    );

    expect(createResult.insertId).toBeGreaterThan(0);
    const photoId = createResult.insertId;

    // 验证照片存在
    let photos = await getCompanyPhotos(testCompanyId);
    let foundPhoto = photos.find(p => p.id === photoId);
    expect(foundPhoto).toBeDefined();

    // 删除照片
    const deleteResult = await deleteCompanyPhoto(photoId);
    expect(deleteResult).toBeDefined();
    expect(deleteResult.success).toBe(true);
    expect(deleteResult.deletedId).toBe(photoId);

    // 验证照片已被删除
    photos = await getCompanyPhotos(testCompanyId);
    foundPhoto = photos.find(p => p.id === photoId);
    expect(foundPhoto).toBeUndefined();
  });

  it('should handle deletion of non-existent photo gracefully', async () => {
    const fakePhotoId = 999999;
    const deleteResult = await deleteCompanyPhoto(fakePhotoId);
    
    // 应该返回 success: false，因为照片不存在
    expect(deleteResult).toBeDefined();
    expect(deleteResult.success).toBe(false);
  });
});
