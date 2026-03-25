const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'EcoLink Backend API',
      version: '1.0.0',
      description:
        'Documentacao da API do EcoLink para integracao de clientes web/mobile.'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Desenvolvimento local'
      }
    ],
    tags: [
      { name: 'Auth', description: 'Autenticacao e emissao de JWT' },
      { name: 'Donations', description: 'Gestao de doacoes' },
      { name: 'Users', description: 'Gestao de perfil e usuarios' },
      { name: 'Roles', description: 'Gestao de papeis (RBAC)' },
      { name: 'Media', description: 'Upload e gerenciamento de arquivos' },
      { name: 'Pickups', description: 'Fluxo de coleta de doacoes' },
      {
        name: 'EcoPoints (US-091)',
        description: 'Dependente da US-091: endpoints ainda nao implementados no backend.'
      },
      {
        name: 'Sessions/QR Code (US-091)',
        description: 'Dependente da US-091: endpoints ainda nao implementados no backend.'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT no formato: Bearer <token>'
        }
      },
      schemas: {
        ObjectId: {
          type: 'string',
          pattern: '^[a-fA-F0-9]{24}$',
          example: '683607d382cf7e288f7ca460'
        },
        GenericSuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' }
          },
          required: ['success', 'message']
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            error: { type: 'string', example: 'Additional details' }
          },
          required: ['success', 'message']
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 42 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            pages: { type: 'integer', example: 5 }
          },
          required: ['total', 'page', 'limit', 'pages']
        },
        Role: {
          type: 'object',
          properties: {
            _id: { $ref: '#/components/schemas/ObjectId' },
            name: { type: 'string', example: 'Admin' },
            description: { type: 'string', example: 'Administrator role' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        UserPublic: {
          type: 'object',
          properties: {
            _id: { $ref: '#/components/schemas/ObjectId' },
            username: { type: 'string', example: 'joao.silva' },
            email: { type: 'string', format: 'email', example: 'joao@ecolink.com' },
            address: { type: 'string', example: 'Rua A, 123' },
            phone: { type: 'string', example: '11999999999' },
            cpf: { type: 'string', example: '12345678901' },
            roleId: {
              oneOf: [
                { $ref: '#/components/schemas/ObjectId' },
                { $ref: '#/components/schemas/Role' }
              ]
            },
            wasteSaved: { type: 'number', example: 12 },
            carbonCredit: { type: 'number', example: 5 },
            totalPickups: { type: 'number', example: 2 },
            createdAt: { type: 'string', format: 'date-time' },
            lastlogin: { type: 'string', format: 'date-time', nullable: true }
          }
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 30, example: 'joao.silva' },
            email: { type: 'string', format: 'email', example: 'joao@ecolink.com' },
            password: {
              type: 'string',
              minLength: 8,
              maxLength: 24,
              example: 'EcoLink@123'
            },
            address: { type: 'string', minLength: 5, example: 'Rua A, 123 - Centro' },
            phone: { type: 'string', example: '11999999999' },
            cpf: { type: 'string', example: '12345678901' },
            roleId: { $ref: '#/components/schemas/ObjectId' }
          },
          required: ['username', 'email', 'password', 'address', 'phone', 'cpf', 'roleId']
        },
        LoginRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email', example: 'joao@ecolink.com' },
            password: { type: 'string', example: 'EcoLink@123' }
          },
          required: ['email', 'password']
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            token: {
              type: 'string',
              example:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzYwN2QzODJjZjdlMjg4ZjdjYTQ2MCJ9.signature'
            },
            user: {
              type: 'object',
              properties: {
                id: { $ref: '#/components/schemas/ObjectId' },
                username: { type: 'string', example: 'joao.silva' },
                email: { type: 'string', format: 'email', example: 'joao@ecolink.com' },
                phone: { type: 'string', example: '11999999999' },
                address: { type: 'string', example: 'Rua A, 123' }
              }
            }
          },
          required: ['success', 'token', 'user']
        },
        Media: {
          type: 'object',
          properties: {
            _id: { $ref: '#/components/schemas/ObjectId' },
            filename: { type: 'string', example: '1741209384-photo.png' },
            path: { type: 'string', example: 'uploads/1741209384-photo.png' },
            type: { type: 'string', example: 'image/png' },
            category: { type: 'string', example: 'Collect' },
            uploadedAt: { type: 'string', format: 'date-time' },
            url: { type: 'string', example: 'http://localhost:5000/uploads/1741209384-photo.png' }
          }
        },
        Donation: {
          type: 'object',
          properties: {
            _id: { $ref: '#/components/schemas/ObjectId' },
            userId: {
              oneOf: [
                { $ref: '#/components/schemas/ObjectId' },
                {
                  type: 'object',
                  properties: {
                    _id: { $ref: '#/components/schemas/ObjectId' },
                    username: { type: 'string' },
                    email: { type: 'string', format: 'email' }
                  }
                }
              ]
            },
            ecopointId: { $ref: '#/components/schemas/ObjectId' },
            donationDate: { type: 'string', format: 'date-time' },
            materialType: {
              type: 'string',
              enum: ['plastic', 'metal', 'glass', 'paper'],
              example: 'plastic'
            },
            description: { type: 'string', example: 'Garrafas PET limpas' },
            qtdMaterial: { type: 'integer', example: 12 },
            mediaId: {
              oneOf: [
                { $ref: '#/components/schemas/ObjectId' },
                { $ref: '#/components/schemas/Media' }
              ]
            }
          }
        },
        Pickup: {
          type: 'object',
          properties: {
            _id: { $ref: '#/components/schemas/ObjectId' },
            donationId: {
              oneOf: [
                { $ref: '#/components/schemas/ObjectId' },
                { $ref: '#/components/schemas/Donation' }
              ]
            },
            userId: {
              oneOf: [
                { $ref: '#/components/schemas/ObjectId' },
                { $ref: '#/components/schemas/UserPublic' }
              ]
            },
            ecopointId: { $ref: '#/components/schemas/ObjectId' },
            pickupBy: {
              oneOf: [
                { $ref: '#/components/schemas/ObjectId' },
                { $ref: '#/components/schemas/UserPublic' }
              ],
              nullable: true
            },
            pickupStatus: {
              type: 'string',
              enum: ['pending', 'accepted', 'completed', 'cancelled'],
              example: 'pending'
            },
            confirmedAt: { type: 'string', format: 'date-time', nullable: true },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
            cancelledAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateDonationRequest: {
          type: 'object',
          properties: {
            ecopointId: { $ref: '#/components/schemas/ObjectId' },
            materialType: {
              type: 'string',
              enum: ['plastic', 'metal', 'glass', 'paper'],
              example: 'plastic'
            },
            description: { type: 'string', example: 'Garrafas PET limpas' },
            qtdMaterial: { type: 'integer', minimum: 1, example: 12 },
            mediaId: { $ref: '#/components/schemas/ObjectId' }
          },
          required: ['ecopointId', 'materialType', 'qtdMaterial', 'mediaId']
        },
        UpdateDonationRequest: {
          type: 'object',
          properties: {
            materialType: {
              type: 'string',
              enum: ['plastic', 'metal', 'glass', 'paper'],
              example: 'metal'
            },
            description: { type: 'string', example: 'Latas de aluminio' },
            qtdMaterial: { type: 'integer', minimum: 1, example: 8 }
          }
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 30, example: 'joao.novo' },
            address: { type: 'string', minLength: 5, example: 'Rua B, 456' },
            phone: { type: 'string', example: '11988887777' }
          }
        },
        ChangePasswordRequest: {
          type: 'object',
          properties: {
            currentPassword: { type: 'string', example: 'EcoLink@123' },
            newPassword: { type: 'string', minLength: 8, maxLength: 24, example: 'EcoLink@456' }
          },
          required: ['currentPassword', 'newPassword']
        },
        ChangeRoleRequest: {
          type: 'object',
          properties: {
            roleId: { $ref: '#/components/schemas/ObjectId' }
          },
          required: ['roleId']
        },
        UpdateMediaRequest: {
          type: 'object',
          properties: {
            category: { type: 'string', example: 'Storage' }
          },
          required: ['category']
        },
        AcceptPickupRequest: {
          type: 'object',
          properties: {
            pickupBy: {
              allOf: [{ $ref: '#/components/schemas/ObjectId' }],
              description: 'Opcional: se nao enviado, backend usa o usuario autenticado'
            }
          }
        },
        UpdatePickupStatusRequest: {
          type: 'object',
          properties: {
            pickupStatus: {
              type: 'string',
              enum: ['pending', 'accepted', 'completed', 'cancelled'],
              example: 'completed'
            }
          },
          required: ['pickupStatus']
        },
        DonationListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Donation' }
            },
            pagination: { $ref: '#/components/schemas/Pagination' }
          }
        },
        PickupListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Pickup' }
            },
            pagination: { $ref: '#/components/schemas/Pagination' }
          }
        },
        UserListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/UserPublic' }
            },
            pagination: { $ref: '#/components/schemas/Pagination' }
          }
        },
        MediaListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Media' }
            },
            pagination: { $ref: '#/components/schemas/Pagination' }
          }
        },
        DonationCreateResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Donation and pickup created successfully' },
            donation: { $ref: '#/components/schemas/Donation' },
            pickup: { $ref: '#/components/schemas/Pickup' }
          }
        },
        MediaUploadResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'File uploaded successfully' },
            data: { $ref: '#/components/schemas/Media' }
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Requisicao invalida (400)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message: 'Validation failed',
                error: 'Provided IDs are invalid.'
              }
            }
          }
        },
        Unauthorized: {
          description: 'Nao autenticado (401)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message: 'Access denied. No token provided.'
              }
            }
          }
        },
        Forbidden: {
          description: 'Sem permissao (403)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message: 'Access denied'
              }
            }
          }
        },
        NotFound: {
          description: 'Recurso nao encontrado (404)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message: 'Resource not found'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Erro interno do servidor (500)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                message: 'Internal Server Error'
              }
            }
          }
        }
      }
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Registrar novo usuario',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' }
              }
            }
          },
          responses: {
            201: {
              description: 'Usuario registrado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GenericSuccessResponse' },
                  example: {
                    success: true,
                    message: 'User registered successfully'
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Autenticar usuario e retornar JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Login realizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginResponse' }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/donation': {
        post: {
          tags: ['Donations'],
          summary: 'Criar doacao e pickup automatico',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateDonationRequest' }
              }
            }
          },
          responses: {
            201: {
              description: 'Doacao criada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DonationCreateResponse' }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        },
        get: {
          tags: ['Donations'],
          summary: 'Listar doacoes com filtros e paginacao',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'materialType', in: 'query', schema: { type: 'string', enum: ['plastic', 'metal', 'glass', 'paper'] } },
            { name: 'userId', in: 'query', schema: { $ref: '#/components/schemas/ObjectId' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: {
              description: 'Lista de doacoes',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DonationListResponse' }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/donation/my': {
        get: {
          tags: ['Donations'],
          summary: 'Listar minhas doacoes',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: {
              description: 'Lista de doacoes do usuario autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DonationListResponse' }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/donation/{id}': {
        get: {
          tags: ['Donations'],
          summary: 'Buscar doacao por ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { $ref: '#/components/schemas/ObjectId' }
            }
          ],
          responses: {
            200: {
              description: 'Doacao encontrada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Donation' }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        },
        put: {
          tags: ['Donations'],
          summary: 'Atualizar doacao (dono ou admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { $ref: '#/components/schemas/ObjectId' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateDonationRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Doacao atualizada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Donation updated successfully' },
                      data: { $ref: '#/components/schemas/Donation' }
                    }
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        },
        delete: {
          tags: ['Donations'],
          summary: 'Remover doacao (dono ou admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { $ref: '#/components/schemas/ObjectId' }
            }
          ],
          responses: {
            200: {
              description: 'Doacao removida',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GenericSuccessResponse' },
                  example: {
                    success: true,
                    message: 'Donation and associated pickup deleted successfully'
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Obter meu perfil',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Perfil do usuario autenticado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/UserPublic' }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        },
        put: {
          tags: ['Users'],
          summary: 'Atualizar meu perfil',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateProfileRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Perfil atualizado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Profile updated successfully' },
                      data: { $ref: '#/components/schemas/UserPublic' }
                    }
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        },
        delete: {
          tags: ['Users'],
          summary: 'Deletar minha conta',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Conta removida',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GenericSuccessResponse' },
                  example: {
                    success: true,
                    message: 'Account and all associated data deleted successfully'
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/users/me/password': {
        put: {
          tags: ['Users'],
          summary: 'Alterar minha senha',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChangePasswordRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Senha alterada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GenericSuccessResponse' },
                  example: {
                    success: true,
                    message: 'Password changed successfully'
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'Listar usuarios (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'roleId', in: 'query', schema: { $ref: '#/components/schemas/ObjectId' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: {
              description: 'Lista de usuarios',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserListResponse' }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Buscar usuario por ID (admin ou dono)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }
          ],
          responses: {
            200: {
              description: 'Usuario encontrado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/UserPublic' }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        },
        delete: {
          tags: ['Users'],
          summary: 'Deletar usuario por ID (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }
          ],
          responses: {
            200: {
              description: 'Usuario removido',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GenericSuccessResponse' },
                  example: {
                    success: true,
                    message: 'User and all associated data deleted successfully'
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/roles': {
        get: {
          tags: ['Roles'],
          summary: 'Listar roles',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Lista de roles',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Role' }
                      }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/roles/edit/{userId}': {
        put: {
          tags: ['Roles'],
          summary: 'Alterar role de usuario (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'userId', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChangeRoleRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Role alterada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Access level updated successfully.' },
                      user: { $ref: '#/components/schemas/UserPublic' }
                    }
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/media/upload': {
        post: {
          tags: ['Media'],
          summary: 'Upload de arquivo de midia',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: { type: 'string', format: 'binary' },
                    category: { type: 'string', example: 'Collect' }
                  },
                  required: ['file']
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Arquivo enviado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/MediaUploadResponse' }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/media': {
        get: {
          tags: ['Media'],
          summary: 'Listar midias com filtros e paginacao',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
          ],
          responses: {
            200: {
              description: 'Lista de midias',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/MediaListResponse' }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/media/categories': {
        get: {
          tags: ['Media'],
          summary: 'Listar categorias de midia',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Categorias disponiveis',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { type: 'string', example: 'Collect' }
                      }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/media/{id}': {
        get: {
          tags: ['Media'],
          summary: 'Buscar midia por ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }
          ],
          responses: {
            200: {
              description: 'Midia encontrada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Media' }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        },
        put: {
          tags: ['Media'],
          summary: 'Atualizar categoria da midia',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateMediaRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Midia atualizada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Media category updated successfully' },
                      data: { $ref: '#/components/schemas/Media' }
                    }
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        },
        delete: {
          tags: ['Media'],
          summary: 'Remover midia',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }
          ],
          responses: {
            200: {
              description: 'Midia removida',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GenericSuccessResponse' },
                  example: {
                    success: true,
                    message: 'Media and file deleted successfully'
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/pickups': {
        get: {
          tags: ['Pickups'],
          summary: 'Listar pickups com filtros e paginacao',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'pickupStatus',
              in: 'query',
              schema: { type: 'string', enum: ['pending', 'accepted', 'completed', 'cancelled'] }
            },
            { name: 'userId', in: 'query', schema: { $ref: '#/components/schemas/ObjectId' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: {
              description: 'Lista de pickups',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PickupListResponse' }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/pickups/my': {
        get: {
          tags: ['Pickups'],
          summary: 'Listar pickups criados por mim',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: {
              description: 'Lista de pickups do usuario autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PickupListResponse' }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/pickups/accepted': {
        get: {
          tags: ['Pickups'],
          summary: 'Listar pickups aceitos por mim',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: {
              description: 'Lista de pickups aceitos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PickupListResponse' }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/pickups/pending': {
        get: {
          tags: ['Pickups'],
          summary: 'Listar pickups pendentes (editor/admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: {
              description: 'Lista de pickups pendentes',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PickupListResponse' }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/pickups/{id}': {
        get: {
          tags: ['Pickups'],
          summary: 'Buscar pickup por ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }
          ],
          responses: {
            200: {
              description: 'Pickup encontrado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Pickup' }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        },
        delete: {
          tags: ['Pickups'],
          summary: 'Deletar pickup (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }
          ],
          responses: {
            200: {
              description: 'Pickup removido',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GenericSuccessResponse' },
                  example: {
                    success: true,
                    message: 'Pickup deleted successfully'
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/pickups/{id}/accept': {
        put: {
          tags: ['Pickups'],
          summary: 'Aceitar pickup (editor/admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }
          ],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AcceptPickupRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Pickup aceito',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Pickup accepted successfully' },
                      data: { $ref: '#/components/schemas/Pickup' }
                    }
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/pickups/{id}/complete': {
        put: {
          tags: ['Pickups'],
          summary: 'Completar pickup (quem aceitou)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }
          ],
          responses: {
            200: {
              description: 'Pickup completado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Pickup completed successfully' },
                      data: { $ref: '#/components/schemas/Pickup' }
                    }
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/pickups/{id}/cancel': {
        put: {
          tags: ['Pickups'],
          summary: 'Cancelar pickup (criador ou aceitou)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }
          ],
          responses: {
            200: {
              description: 'Pickup cancelado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Pickup cancelled successfully' },
                      data: { $ref: '#/components/schemas/Pickup' }
                    }
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      },
      '/api/pickups/{id}/status': {
        put: {
          tags: ['Pickups'],
          summary: 'Atualizar status manualmente (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { $ref: '#/components/schemas/ObjectId' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdatePickupStatusRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Status atualizado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Pickup status updated successfully' },
                      data: { $ref: '#/components/schemas/Pickup' }
                    }
                  }
                }
              }
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' }
          }
        }
      }
    }
  },
  apis: []
};

module.exports = swaggerJsdoc(options);
