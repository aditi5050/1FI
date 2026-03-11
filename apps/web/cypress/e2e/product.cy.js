describe('Product Page Flow', () => {
  it('should visit homepage, open a product, interact and click checkout', () => {
    // 1. Visit homepage
    cy.visit('http://localhost:3000');
    
    // 2. Click product to open /products/:slug
    cy.contains('Our Products').should('be.visible');
    cy.contains('Apple iPhone 17 Pro').should('exist');
    cy.contains('View Details').first().click();
    
    // Check we navigated successfully
    cy.url().should('include', '/products/');
    
    // 3. Verify thumbnails change main image
    // Find the second thumbnail and click it
    cy.get('img[alt*="shadow"]').eq(1).click();
    
    // Capture the clicked thumbnail source
    cy.get('img[alt*="shadow"]').eq(1).invoke('attr', 'src').then((thumbSrc) => {
      // Check if main image source updated to match thumbnail
      cy.get('.bg-gray-50 > img').should('have.attr', 'src', thumbSrc);
    });

    // 4. Select EMI plan and click CTA to reach checkout placeholder
    // Wait for EMI plans to load and be visible
    cy.contains('Choose EMI Tenure').should('be.visible');
    
    // Select the second radio button
    cy.get('input[type="radio"][name="emiplan"]').eq(1).check({force: true});
    
    // Click checkout
    cy.contains('Buy on').click();
    
    // URL should have checkout pattern
    cy.url().should('include', '/checkout?product=');
  });
});