import { Router } from 'express';
import authRoutes from './auth/auth.routes';
import transactionRoutes from './transaction/routes/transaction.routes';
import recurringTransactionRoutes from './transaction/routes/recurring-transaction.routes';
import categoryRoutes from './category/routes/category.routes';

// Import docs to trigger their registrations in the OpenAPI registry
import './auth/auth.docs';
import './transaction/docs/transaction.docs';
import './transaction/docs/recurring-transaction.docs';
import './category/category.docs';

import { generateOpenApiDocument } from './common/utils/swagger';
import swaggerUi from 'swagger-ui-express';

const router = Router();

// Retrieve generated OpenAPI specification object
const openApiSpec = generateOpenApiDocument();

router.get('/swagger.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openApiSpec);
});

// Expose Swagger UI
router.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
router.get('/docs-json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openApiSpec);
});

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/recurring-transactions', recurringTransactionRoutes);
router.use('/categories', categoryRoutes);

export default router;
